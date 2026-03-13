<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainerController extends Controller
{
    public function index(Request $request)
    {
        $trainers = Trainer::withCount(['programGroups', 'trainingSessions'])
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->gender, fn($q, $g) => $q->where('gender', $g))
            ->when($request->is_internal !== null, fn($q) => $q->where('is_internal', $request->is_internal))
            ->when($request->government !== null && $request->government !== '', fn($q) => $q->where('is_government_employee', $request->government))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Trainers/Index', [
            'trainers' => $trainers,
            'filters' => $request->only(['search', 'gender', 'is_internal', 'government']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'national_id' => 'nullable|string|max:50',
            'employee_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255|unique:trainers,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'nationality' => 'nullable|string|max:100',
            'employer_type' => 'nullable|string|max:50',
            'employer' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:100',
            'academic_specialization' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'training_experience_years' => 'nullable|integer|min:0',
            'is_certified_trainer' => 'boolean',
            'can_prepare_packages' => 'boolean',
            'training_fields' => 'nullable|string',
            'training_gender' => 'nullable|string|max:50',
            'trainer_evaluation' => 'nullable|string',
            'cooperation_status' => 'nullable|string|max:100',
            'is_internal' => 'boolean',
            'is_active' => 'boolean',
            'is_government_employee' => 'boolean',
            'direct_manager' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if (!empty($validated['training_experience_years'])) {
            $validated['experience_base_date'] = Carbon::now()->toDateString();
        }

        Trainer::create($validated);

        return back()->with('success', 'تم إضافة المدرب بنجاح');
    }

    public function show(Trainer $trainer)
    {
        $trainer->load(['programGroups.package.program', 'programGroups.trainees', 'trainingSessions']);

        $trainingHistory = $trainer->programGroups->map(function ($group) {
            return [
                'id' => $group->id,
                'program_name' => $group->package->program->name ?? '-',
                'package_name' => $group->package->name ?? '-',
                'group_name' => $group->name,
                'start_date' => $group->start_date?->format('Y-m-d'),
                'end_date' => $group->end_date?->format('Y-m-d'),
                'trainees_count' => $group->trainees->count(),
                'status' => $group->status,
            ];
        });

        $totalHours = $trainer->programGroups->sum(function ($group) {
            return $group->package->hours ?? 0;
        });

        $totalTrainees = $trainer->programGroups->sum(function ($group) {
            return $group->trainees->count();
        });

        $trainerData = $trainer->toArray();
        $trainerData['training_history'] = $trainingHistory;
        $trainerData['total_hours'] = $totalHours;
        $trainerData['total_trainees'] = $totalTrainees;

        return Inertia::render('Trainers/Index', [
            'trainer' => $trainerData,
        ]);
    }

    public function update(Request $request, Trainer $trainer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'national_id' => 'nullable|string|max:50',
            'employee_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255|unique:trainers,email,' . $trainer->id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'nationality' => 'nullable|string|max:100',
            'employer_type' => 'nullable|string|max:50',
            'employer' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:100',
            'academic_specialization' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'training_experience_years' => 'nullable|integer|min:0',
            'is_certified_trainer' => 'boolean',
            'can_prepare_packages' => 'boolean',
            'training_fields' => 'nullable|string',
            'training_gender' => 'nullable|string|max:50',
            'trainer_evaluation' => 'nullable|string',
            'cooperation_status' => 'nullable|string|max:100',
            'is_internal' => 'boolean',
            'is_active' => 'boolean',
            'is_government_employee' => 'boolean',
            'direct_manager' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['training_experience_years']) && !$trainer->experience_base_date) {
            $validated['experience_base_date'] = Carbon::now()->toDateString();
        }

        $trainer->update($validated);

        return back()->with('success', 'تم تحديث المدرب بنجاح');
    }

    public function destroy(Trainer $trainer)
    {
        $trainer->delete();
        return back()->with('success', 'تم حذف المدرب بنجاح');
    }
}
