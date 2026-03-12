<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\DropdownOption;
use App\Models\Program;
use App\Models\Setting;
use App\Models\TrainingHall;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current();
        $programTypes = DropdownOption::getOptions('program_types');

        $isArchived = $request->boolean('archived');

        $programs = Program::with(['academicYear', 'supervisor', 'packages'])
            ->withCount('packages')
            ->where('is_archived', $isArchived)
            ->when($request->year_id, fn($q, $id) => $q->where('academic_year_id', $id))
            ->when(!$request->year_id && $currentYear, fn($q) => $q->where('academic_year_id', $currentYear->id))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Programs/Index', [
            'programs' => $programs,
            'academicYears' => AcademicYear::orderByDesc('start_date')->get(),
            'supervisors' => User::role(['admin', 'supervisor'])->get(['id', 'name']),
            'currentYear' => $currentYear,
            'programTypes' => $programTypes,
            'filters' => $request->only(['search', 'year_id', 'type', 'archived']),
        ]);
    }

    public function store(Request $request)
    {
        $currentYear = AcademicYear::current();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|max:100',
            'status' => 'required|in:new,existing',
            'hours' => 'integer|min:0',
            'target_audience' => 'nullable|string|max:255',
            'male_count' => 'integer|min:0',
            'female_count' => 'integer|min:0',
            'supervisor_id' => 'nullable|exists:users,id',
            'content_preparer_id' => 'nullable|exists:users,id',
        ]);

        $validated['academic_year_id'] = $currentYear->id;
        $validated['target_count'] = ($validated['male_count'] ?? 0) + ($validated['female_count'] ?? 0);

        Program::create($validated);

        return back()->with('success', 'تم إضافة البرنامج بنجاح');
    }

    public function show(Program $program)
    {
        $program->load(['academicYear', 'supervisor', 'contentPreparer', 'packages.supervisor', 'packages.programGroups.trainingHall']);

        $usedHours = $program->packages->sum('hours');
        $hoursPerDay = (int) Setting::get('hours_per_day', 5);

        return Inertia::render('Programs/Show', [
            'program' => $program,
            'supervisors' => User::role(['admin', 'supervisor'])->get(['id', 'name']),
            'halls' => TrainingHall::active()->get(['id', 'name', 'capacity']),
            'hoursPerDay' => $hoursPerDay,
            'usedHours' => $usedHours,
        ]);
    }

    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|max:100',
            'status' => 'required|in:new,existing',
            'hours' => 'integer|min:0',
            'target_audience' => 'nullable|string|max:255',
            'male_count' => 'integer|min:0',
            'female_count' => 'integer|min:0',
            'supervisor_id' => 'nullable|exists:users,id',
            'content_preparer_id' => 'nullable|exists:users,id',
            'is_approved' => 'boolean',
        ]);

        $validated['target_count'] = ($validated['male_count'] ?? 0) + ($validated['female_count'] ?? 0);

        $program->update($validated);

        return back()->with('success', 'تم تحديث البرنامج بنجاح');
    }

    public function destroy(Program $program)
    {
        $program->delete();
        return redirect()->route('programs.index')->with('success', 'تم حذف البرنامج بنجاح');
    }

    public function toggleArchive(Program $program)
    {
        $program->update(['is_archived' => !$program->is_archived]);
        $message = $program->is_archived ? 'تم أرشفة البرنامج بنجاح' : 'تم استعادة البرنامج بنجاح';
        return back()->with('success', $message);
    }
}
