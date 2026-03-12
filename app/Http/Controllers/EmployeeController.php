<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::with('school')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('employee_number', 'like', "%{$s}%"))
            ->when($request->school_id, fn($q, $id) => $q->where('school_id', $id))
            ->when($request->gender, fn($q, $g) => $q->where('gender', $g))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'schools' => School::active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'school_id', 'gender']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
            'name' => 'required|string|max:255',
            'employee_number' => 'nullable|string|max:50|unique:employees,employee_number',
            'national_id' => 'nullable|string|max:20|unique:employees,national_id',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'job_title' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Employee::create($validated);

        return back()->with('success', 'تم إضافة المتدرب بنجاح');
    }

    public function show(Employee $employee)
    {
        $employee->load([
            'school',
            'trainees.programGroup.package.program',
            'trainees.programGroup.trainer',
            'trainees.programGroup.trainingHall',
            'trainees.programGroup.trainingSessions',
        ]);

        $trainingHistory = $employee->trainees->map(function ($trainee) {
            $group = $trainee->programGroup;
            $sessions = $group->trainingSessions;

            return [
                'id' => $trainee->id,
                'program_name' => $group->package->program->name ?? '-',
                'package_name' => $group->package->name ?? '-',
                'group_name' => $group->name,
                'trainer_name' => $group->trainer->name ?? '-',
                'hall_name' => $group->trainingHall->name ?? '-',
                'start_date' => $group->start_date?->format('Y-m-d'),
                'end_date' => $group->end_date?->format('Y-m-d'),
                'sessions_count' => $sessions->count(),
                'status' => $trainee->status,
                'grade' => $trainee->grade,
                'group_status' => $group->status,
            ];
        });

        $employeeData = $employee->toArray();
        $employeeData['training_history'] = $trainingHistory;
        $employeeData['total_courses'] = $trainingHistory->count();

        return Inertia::render('Employees/Index', [
            'employee' => $employeeData,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'school_id' => 'nullable|exists:schools,id',
            'name' => 'required|string|max:255',
            'employee_number' => 'nullable|string|max:50|unique:employees,employee_number,' . $employee->id,
            'national_id' => 'nullable|string|max:20|unique:employees,national_id,' . $employee->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'job_title' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $employee->update($validated);

        return back()->with('success', 'تم تحديث المتدرب بنجاح');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return back()->with('success', 'تم حذف المتدرب بنجاح');
    }
}
