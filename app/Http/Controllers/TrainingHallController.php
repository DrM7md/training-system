<?php

namespace App\Http\Controllers;

use App\Models\TrainingHall;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainingHallController extends Controller
{
    public function index()
    {
        $halls = TrainingHall::withCount(['programGroups', 'trainingSessions'])
            ->orderByRaw("CAST(REGEXP_SUBSTR(name, '[0-9]+') AS UNSIGNED), name")
            ->paginate(50);

        return Inertia::render('TrainingHalls/Index', [
            'halls' => $halls,
        ]);
    }

    public function show(TrainingHall $trainingHall)
    {
        $trainingHall->load([
            'programGroups.package.program',
            'programGroups.trainer',
            'programGroups.trainees',
            'programGroups.trainingSessions',
        ]);

        $bookedPrograms = $trainingHall->programGroups->map(function ($group) {
            $sessions = $group->trainingSessions;
            $firstSession = $sessions->first();
            $lastSession = $sessions->last();

            return [
                'id' => $group->id,
                'program_name' => $group->package->program->name ?? '-',
                'package_name' => $group->package->name ?? '-',
                'group_name' => $group->name,
                'trainer_name' => $group->trainer->name ?? '-',
                'start_date' => $group->start_date?->format('Y-m-d'),
                'end_date' => $group->end_date?->format('Y-m-d'),
                'session_start' => $firstSession?->date?->format('Y-m-d'),
                'session_end' => $lastSession?->date?->format('Y-m-d'),
                'sessions_count' => $sessions->count(),
                'trainees_count' => $group->trainees->count(),
                'status' => $group->status,
                'gender' => $group->gender,
            ];
        });

        $hallData = $trainingHall->toArray();
        $hallData['booked_programs'] = $bookedPrograms;

        return Inertia::render('TrainingHalls/Index', [
            'hall' => $hallData,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'gender_priority' => 'nullable|in:male,female,all',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        TrainingHall::create($validated);

        return back()->with('success', 'تم إضافة القاعة بنجاح');
    }

    public function update(Request $request, TrainingHall $trainingHall)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'gender_priority' => 'nullable|in:male,female,all',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $trainingHall->update($validated);

        return back()->with('success', 'تم تحديث القاعة بنجاح');
    }

    public function destroy(TrainingHall $trainingHall)
    {
        $trainingHall->delete();
        return back()->with('success', 'تم حذف القاعة بنجاح');
    }
}
