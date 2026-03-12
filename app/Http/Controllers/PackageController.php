<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Package;
use App\Models\Program;
use App\Models\ProgramGroup;
use App\Models\Setting;
use App\Models\TrainingHall;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current();
        $currentYearId = $currentYear?->id;

        $packages = Package::with(['program.academicYear', 'supervisor', 'programGroups'])
            ->withCount('programGroups')
            ->whereHas('program', fn($q) => $q->where('is_archived', false))
            ->when($currentYearId, fn($q) => $q->whereHas('program', fn($q2) => $q2->where('academic_year_id', $currentYearId)))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->program_id, fn($q, $id) => $q->where('program_id', $id))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        $programQuery = Program::with('academicYear')->where('is_archived', false);
        $programs = $currentYearId
            ? $programQuery->where('academic_year_id', $currentYearId)->get(['id', 'name', 'academic_year_id', 'hours', 'target_count', 'male_count', 'female_count'])
            : $programQuery->get(['id', 'name', 'academic_year_id', 'hours', 'target_count', 'male_count', 'female_count']);

        $hoursPerDay = (int) Setting::get('hours_per_day', 5);

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'programs' => $programs,
            'supervisors' => User::role(['admin', 'supervisor'])->get(['id', 'name']),
            'halls' => TrainingHall::active()->get(['id', 'name', 'capacity']),
            'filters' => $request->only(['search', 'program_id']),
            'hoursPerDay' => $hoursPerDay,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hours' => 'required|integer|min:1',
            'days' => 'required|integer|min:1',
            'supervisor_id' => 'nullable|exists:users,id',
            'auto_create_groups' => 'boolean',
        ]);

        $package = Package::create($validated);

        if ($request->boolean('auto_create_groups')) {
            $this->createAutoGroups($package);
        }

        return back()->with('success', 'تم إضافة الحقيبة بنجاح');
    }

    protected function createAutoGroups(Package $package)
    {
        $program = $package->program;
        $halls = TrainingHall::active()->withCount(['programGroups' => function ($q) {
            $q->where('status', '!=', 'cancelled');
        }])->orderBy('capacity', 'desc')->get();

        if ($halls->isEmpty()) {
            return;
        }

        $groupNumber = 1;
        $genderBatches = [];

        if ($program->male_count > 0) {
            $genderBatches[] = ['gender' => 'male', 'count' => $program->male_count];
        }
        if ($program->female_count > 0) {
            $genderBatches[] = ['gender' => 'female', 'count' => $program->female_count];
        }
        if (empty($genderBatches) && $program->target_count > 0) {
            $genderBatches[] = ['gender' => 'mixed', 'count' => $program->target_count];
        }

        foreach ($genderBatches as $batch) {
            $remaining = $batch['count'];

            while ($remaining > 0) {
                // Find hall with most available capacity (capacity - current groups assigned)
                $bestHall = $halls->sortBy('program_groups_count')->first();
                $hallCapacity = $bestHall->capacity ?: 25;
                $groupSize = min($hallCapacity, $remaining);

                ProgramGroup::create([
                    'package_id' => $package->id,
                    'name' => 'مجموعة ' . $groupNumber,
                    'gender' => $batch['gender'],
                    'capacity' => $groupSize,
                    'training_hall_id' => $bestHall->id,
                    'status' => 'scheduled',
                ]);

                // Increment the in-memory count so next iteration picks a less-loaded hall
                $bestHall->program_groups_count++;
                $remaining -= $groupSize;
                $groupNumber++;
            }
        }
    }

    public function show(Package $package)
    {
        $package->load(['program.academicYear', 'supervisor', 'programGroups.trainer', 'programGroups.trainingHall', 'programGroups.semester']);
        $package->loadCount('programGroups');

        return response()->json([
            'package' => $package,
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hours' => 'required|integer|min:1',
            'days' => 'required|integer|min:1',
            'supervisor_id' => 'nullable|exists:users,id',
        ]);

        $package->update($validated);

        return back()->with('success', 'تم تحديث الحقيبة بنجاح');
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return back()->with('success', 'تم حذف الحقيبة بنجاح');
    }
}
