<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
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
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Trainers/Index', [
            'trainers' => $trainers,
            'filters' => $request->only(['search', 'gender', 'is_internal']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:trainers,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'is_internal' => 'boolean',
            'is_active' => 'boolean',
        ]);

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
            'email' => 'nullable|email|max:255|unique:trainers,email,' . $trainer->id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'required|in:male,female',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'is_internal' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $trainer->update($validated);

        return back()->with('success', 'تم تحديث المدرب بنجاح');
    }

    public function destroy(Trainer $trainer)
    {
        $trainer->delete();
        return back()->with('success', 'تم حذف المدرب بنجاح');
    }
}
