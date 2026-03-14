<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\HallReservation;
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
            ->paginate(200)
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
            'halls' => TrainingHall::active()->get(['id', 'name', 'capacity', 'gender_priority']),
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
            'training_mode' => 'required|in:in_person,remote,both',
            'supervisor_id' => 'nullable|exists:users,id',
            'auto_create_groups' => 'boolean',
            'male_count' => 'nullable|integer|min:0',
            'female_count' => 'nullable|integer|min:0',
        ]);

        $package = Package::create($validated);

        if ($request->boolean('auto_create_groups')) {
            $maleCount = $request->input('male_count', $package->program->male_count ?? 0);
            $femaleCount = $request->input('female_count', $package->program->female_count ?? 0);
            $this->createAutoGroups($package, (int) $maleCount, (int) $femaleCount);
        }

        return back()->with('success', 'تم إضافة الحقيبة بنجاح');
    }

    public function generateGroups(Request $request, Package $package)
    {
        $validated = $request->validate([
            'male_count' => 'required|integer|min:0',
            'female_count' => 'required|integer|min:0',
        ]);

        if ($validated['male_count'] == 0 && $validated['female_count'] == 0) {
            return back()->with('error', 'يجب تحديد عدد الذكور أو الإناث');
        }

        $result = $this->createAutoGroups($package, $validated['male_count'], $validated['female_count']);

        return back()->with('success', "تم إنشاء {$result['groups_created']} مجموعة بنجاح على {$result['halls_used']} قاعة");
    }

    protected function createAutoGroups(Package $package, int $maleCount, int $femaleCount): array
    {
        // Get halls with active reservations excluded
        $reservedHallIds = HallReservation::pluck('training_hall_id')->unique()->toArray();

        $halls = TrainingHall::active()
            ->whereNotIn('id', $reservedHallIds)
            ->withCount(['programGroups' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }])
            ->get();

        if ($halls->isEmpty()) {
            return ['groups_created' => 0, 'halls_used' => 0];
        }

        $groupNumber = $package->programGroups()->count() + 1;
        $genderBatches = [];
        $groupsCreated = 0;
        $hallsUsed = [];

        if ($maleCount > 0) {
            $genderBatches[] = ['gender' => 'male', 'count' => $maleCount];
        }
        if ($femaleCount > 0) {
            $genderBatches[] = ['gender' => 'female', 'count' => $femaleCount];
        }

        foreach ($genderBatches as $batch) {
            // Filter halls by gender priority
            $genderHalls = $halls->filter(function ($hall) use ($batch) {
                if (!$hall->gender_priority) return true; // no priority = available for all
                if ($hall->gender_priority === 'all') return true;
                return $hall->gender_priority === $batch['gender'];
            });

            // Fallback to all halls if no gender-appropriate halls found
            if ($genderHalls->isEmpty()) {
                $genderHalls = $halls;
            }

            $remaining = $batch['count'];

            while ($remaining > 0) {
                // Find hall with least load
                $bestHall = $genderHalls->sortBy('program_groups_count')->first();
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

                $bestHall->program_groups_count++;
                $remaining -= $groupSize;
                $groupNumber++;
                $groupsCreated++;
                $hallsUsed[$bestHall->id] = true;
            }
        }

        return ['groups_created' => $groupsCreated, 'halls_used' => count($hallsUsed)];
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
            'training_mode' => 'required|in:in_person,remote,both',
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
