<?php

namespace App\Http\Controllers;

use App\Models\HallReservation;
use App\Models\TrainingHall;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TrainingHallController extends Controller
{
    public function index()
    {
        $halls = TrainingHall::withCount(['programGroups', 'trainingSessions', 'reservations'])
            ->orderByRaw("CAST(REGEXP_SUBSTR(name, '[0-9]+') AS UNSIGNED), name")
            ->paginate(50);

        $reservations = HallReservation::with(['trainingHall', 'reservedBy'])
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('TrainingHalls/Index', [
            'halls' => $halls,
            'reservations' => $reservations,
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

    public function reserve(Request $request, TrainingHall $trainingHall)
    {
        $validated = $request->validate([
            'purpose' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $validated['training_hall_id'] = $trainingHall->id;
        $validated['reserved_by'] = Auth::id();

        HallReservation::create($validated);

        return back()->with('success', 'تم حجز القاعة بنجاح');
    }

    public function cancelReservation(HallReservation $reservation)
    {
        $reservation->delete();
        return back()->with('success', 'تم إلغاء الحجز بنجاح');
    }
}
