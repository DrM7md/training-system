<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\DropdownOption;
use App\Models\Package;
use App\Models\Program;
use App\Models\ProgramGroup;
use App\Models\Setting;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $assignments = Assignment::with(['trainer', 'program', 'package', 'groups'])
            ->when($request->search, function ($q, $s) {
                $q->whereHas('trainer', fn($q2) => $q2->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('program', fn($q2) => $q2->where('name', 'like', "%{$s}%"));
            })
            ->when($request->type, fn($q, $t) => $q->where('assignment_type', $t))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $trainers = Trainer::select('id', 'name', 'national_id', 'employee_id', 'employer')
            ->orderBy('name')->get();

        $programs = Program::with(['packages.groups' => function ($q) {
            $q->select('program_groups.id', 'program_groups.name', 'program_groups.package_id');
        }, 'packages' => function ($q) {
            $q->select('id', 'program_id', 'name', 'hours', 'days');
        }])->select('id', 'name')->orderBy('name')->get();

        $assignmentTypes = DropdownOption::getOptions('assignment_types');

        return Inertia::render('Assignments/Index', [
            'assignments' => $assignments,
            'trainers' => $trainers,
            'programs' => $programs,
            'assignmentTypes' => $assignmentTypes,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trainer_id' => 'required|exists:trainers,id',
            'program_id' => 'required|exists:programs,id',
            'package_id' => 'required|exists:packages,id',
            'assignment_type' => 'required|string|max:100',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'exists:program_groups,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $assignment = Assignment::create([
            'trainer_id' => $validated['trainer_id'],
            'program_id' => $validated['program_id'],
            'package_id' => $validated['package_id'],
            'assignment_type' => $validated['assignment_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $assignment->groups()->attach($validated['group_ids']);

        return back()->with('success', 'تم إضافة التكليف بنجاح');
    }

    public function update(Request $request, Assignment $assignment)
    {
        $validated = $request->validate([
            'trainer_id' => 'required|exists:trainers,id',
            'program_id' => 'required|exists:programs,id',
            'package_id' => 'required|exists:packages,id',
            'assignment_type' => 'required|string|max:100',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'exists:program_groups,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $assignment->update([
            'trainer_id' => $validated['trainer_id'],
            'program_id' => $validated['program_id'],
            'package_id' => $validated['package_id'],
            'assignment_type' => $validated['assignment_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $assignment->groups()->sync($validated['group_ids']);

        return back()->with('success', 'تم تحديث التكليف بنجاح');
    }

    public function show(Assignment $assignment)
    {
        $assignment->load(['trainer', 'program', 'package', 'groups']);

        return Inertia::render('Assignments/Print', [
            'assignment' => $assignment,
            'organizationName' => Setting::get('organization_name', 'مركز التدريب والتطوير'),
            'organizationLogo' => Setting::get('organization_logo', ''),
        ]);
    }

    public function destroy(Assignment $assignment)
    {
        $assignment->delete();
        return back()->with('success', 'تم حذف التكليف بنجاح');
    }
}
