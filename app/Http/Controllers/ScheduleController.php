<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\OfficialHoliday;
use App\Models\Program;
use App\Models\Trainer;
use App\Models\TrainingHall;
use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current();
        $viewType = $request->view ?? $request->cookie('schedule_view', 'daily');
        $dateStr = $request->date ?? now()->format('Y-m-d');
        $date = Carbon::parse($dateStr);

        if ($viewType === 'daily') {
            $startDate = $date->copy()->startOfDay();
            $endDate = $date->copy()->endOfDay();
        } elseif ($viewType === 'weekly') {
            $startDate = $date->copy()->startOfWeek(Carbon::SUNDAY);
            $endDate = $date->copy()->endOfWeek(Carbon::SATURDAY);
        } else {
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();
        }

        $sessions = TrainingSession::with([
            'programGroup.package.program',
            'programGroup.package.supervisor',
            'programGroup.trainer',
            'programGroup.trainees',
            'trainingHall',
        ])
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'date' => $s->date->format('Y-m-d'),
                'day_number' => $s->day_number,
                'status' => $s->status,
                'program_group' => [
                    'id' => $s->programGroup?->id,
                    'name' => $s->programGroup?->name,
                    'gender' => $s->programGroup?->gender,
                    'capacity' => $s->programGroup?->capacity,
                    'trainees_count' => $s->programGroup?->trainees?->count() ?? 0,
                    'trainer' => $s->programGroup?->trainer ? [
                        'id' => $s->programGroup->trainer->id,
                        'name' => $s->programGroup->trainer->name,
                    ] : null,
                    'package' => [
                        'id' => $s->programGroup?->package?->id,
                        'name' => $s->programGroup?->package?->name,
                        'hours' => $s->programGroup?->package?->hours,
                        'days' => $s->programGroup?->package?->days,
                        'supervisor' => $s->programGroup?->package?->supervisor ? [
                            'id' => $s->programGroup->package->supervisor->id,
                            'name' => $s->programGroup->package->supervisor->name,
                        ] : null,
                        'program' => [
                            'id' => $s->programGroup?->package?->program?->id,
                            'name' => $s->programGroup?->package?->program?->name,
                        ],
                    ],
                ],
                'training_hall' => [
                    'id' => $s->trainingHall?->id,
                    'name' => $s->trainingHall?->name,
                    'capacity' => $s->trainingHall?->capacity,
                ],
            ]);

        $halls = TrainingHall::active()->orderBy('name')->get(['id', 'name', 'capacity', 'gender_priority', 'is_active']);

        // Programs with packages and groups for the booking modal
        // Filter: non-archived programs, non-cancelled groups
        $today = now()->format('Y-m-d');
        $programs = Program::with(['packages.programGroups' => function ($q) {
            $q->where('status', '!=', 'cancelled')
              ->where('status', '!=', 'completed');
        }, 'packages.programGroups.trainingHall', 'packages.programGroups.trainingSessions'])
            ->where('is_archived', false)
            ->whereHas('packages.programGroups', function ($q) {
                $q->where('status', '!=', 'cancelled')
                  ->where('status', '!=', 'completed');
            })
            ->orderBy('name')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'packages' => $p->packages
                    ->filter(fn($pkg) => $pkg->programGroups->isNotEmpty())
                    ->values()
                    ->map(function ($pkg) use ($today) {
                        $activeGroups = [];
                        $completedGroups = [];

                        foreach ($pkg->programGroups as $g) {
                            $sessionsCount = $g->trainingSessions->count();
                            $lastSessionDate = $g->trainingSessions->max('date');

                            // Group is "done" if all sessions scheduled AND last session is in the past
                            $isDone = $sessionsCount >= $pkg->days && $lastSessionDate && $lastSessionDate < $today;

                            if ($isDone) {
                                $completedGroups[] = [
                                    'id' => $g->id,
                                    'name' => $g->name,
                                    'last_session_date' => $lastSessionDate instanceof \Carbon\Carbon
                                        ? $lastSessionDate->format('Y-m-d')
                                        : (string) $lastSessionDate,
                                ];
                            } elseif ($sessionsCount < $pkg->days) {
                                $activeGroups[] = [
                                    'id' => $g->id,
                                    'name' => $g->name,
                                    'gender' => $g->gender,
                                    'hall_name' => $g->trainingHall?->name,
                                    'training_hall_id' => $g->training_hall_id,
                                    'trainer_id' => $g->trainer_id,
                                    'sessions_count' => $sessionsCount,
                                    'remaining_days' => $pkg->days - $sessionsCount,
                                ];
                            }
                        }

                        return [
                            'id' => $pkg->id,
                            'name' => $pkg->name,
                            'days' => $pkg->days,
                            'groups' => $activeGroups,
                            'completed_groups' => $completedGroups,
                        ];
                    }),
            ])
            // Keep programs that have at least one package with active groups
            ->filter(fn($p) => collect($p['packages'])->flatMap(fn($pkg) => $pkg['groups'])->isNotEmpty())
            ->values();

        $holidays = OfficialHoliday::orderBy('start_date')->get(['id', 'name', 'start_date', 'end_date', 'color']);

        return Inertia::render('Schedule/Index', [
            'sessions' => $sessions,
            'halls' => $halls,
            'trainers' => Trainer::active()->get(['id', 'name']),
            'currentDate' => $dateStr,
            'viewType' => $viewType,
            'programs' => $programs,
            'holidays' => $holidays,
        ]);
    }

    public function storeSession(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'exists:program_groups,id',
        ]);

        $date = $validated['date'];
        $created = 0;
        $conflicts = 0;

        foreach ($validated['group_ids'] as $groupId) {
            $group = \App\Models\ProgramGroup::find($groupId);

            // Check if session already exists for this group on this date
            $exists = TrainingSession::where('program_group_id', $groupId)
                ->whereDate('date', $date)
                ->exists();

            if (!$exists && $group) {
                $dayNumber = TrainingSession::where('program_group_id', $groupId)->count() + 1;

                // Check for hall conflict
                $hallConflict = false;
                if ($group->training_hall_id) {
                    $hallConflict = TrainingSession::where('training_hall_id', $group->training_hall_id)
                        ->where('program_group_id', '!=', $groupId)
                        ->whereDate('date', $date)
                        ->where('status', '!=', 'cancelled')
                        ->exists();
                }

                TrainingSession::create([
                    'program_group_id' => $groupId,
                    'training_hall_id' => $group->training_hall_id,
                    'trainer_id' => $group->trainer_id,
                    'date' => $date,
                    'day_number' => $dayNumber,
                    'status' => 'scheduled',
                ]);
                $created++;
                if ($hallConflict) {
                    $conflicts++;
                }
            }
        }

        if ($conflicts > 0) {
            return back()->with('warning', "تم إنشاء {$created} جلسة، لكن يوجد تعارض في {$conflicts} قاعة بنفس التاريخ");
        }

        return back()->with('success', "تم إنشاء {$created} جلسة بنجاح");
    }

    public function moveSession(Request $request, TrainingSession $session)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $session->update(['date' => $validated['date']]);

        return back()->with('success', 'تم نقل الجلسة بنجاح');
    }

    public function updateSession(Request $request, TrainingSession $session)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'training_hall_id' => 'nullable|exists:training_halls,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'status' => 'nullable|in:scheduled,completed,cancelled,postponed',
            'postponed_to' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $session->update($validated);

        // Sync hall and trainer changes to the group
        $groupUpdates = [];
        if (isset($validated['training_hall_id'])) {
            $groupUpdates['training_hall_id'] = $validated['training_hall_id'];
        }
        if (isset($validated['trainer_id'])) {
            $groupUpdates['trainer_id'] = $validated['trainer_id'];
        }
        if (!empty($groupUpdates)) {
            $session->programGroup->update($groupUpdates);
        }

        return back()->with('success', 'تم تحديث الجلسة بنجاح');
    }
}
