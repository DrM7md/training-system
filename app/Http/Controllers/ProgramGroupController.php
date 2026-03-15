<?php

namespace App\Http\Controllers;

use App\Models\DropdownOption;
use App\Models\Employee;
use App\Models\Package;
use App\Models\ProgramGroup;
use App\Models\Semester;
use App\Models\Trainee;
use App\Models\Trainer;
use App\Models\TrainingHall;
use App\Models\TrainingSession;
use App\Models\OfficialHoliday;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ProgramGroupController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current();
        $currentYearId = $currentYear?->id;

        $groups = ProgramGroup::with(['package.program', 'trainer', 'trainingHall', 'semester'])
            ->withCount('trainees')
            ->when($currentYearId, fn($q) => $q->whereHas('package.program', fn($q2) => $q2->where('academic_year_id', $currentYearId)))
            ->when($request->search, fn($q, $s) => $q->whereHas('package', fn($q2) => $q2->where('name', 'like', "%{$s}%")))
            ->when($request->package_id, fn($q, $id) => $q->where('package_id', $id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $packages = $currentYearId
            ? Package::with('program')->whereHas('program', fn($q) => $q->where('academic_year_id', $currentYearId))->get()
            : Package::with('program')->get();

        // Get IDs of halls already assigned to active groups (excluding current edit)
        $bookedHallIds = ProgramGroup::whereNotNull('training_hall_id')
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->pluck('training_hall_id')
            ->toArray();

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
            'packages' => $packages,
            'trainers' => Trainer::active()->get(['id', 'name']),
            'halls' => TrainingHall::active()->get(['id', 'name', 'capacity', 'gender_priority']),
            'bookedHallIds' => $bookedHallIds,
            'statuses' => DropdownOption::getOptions('group_statuses'),
            'filters' => $request->only(['search', 'package_id', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'training_hall_id' => 'nullable|exists:training_halls,id',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,mixed',
            'status' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'scheduled';

        $group = ProgramGroup::create($validated);

        return back()->with('success', 'تم إضافة المجموعة بنجاح');
    }

    public function show(ProgramGroup $group)
    {
        $group->load([
            'package.program',
            'trainer',
            'trainingHall',
            'semester',
            'trainingSessions',
            'trainees.employee.school'
        ]);

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'trainers' => Trainer::active()->get(['id', 'name']),
            'halls' => TrainingHall::active()->get(['id', 'name', 'capacity', 'gender_priority']),
            'employees' => Employee::active()->with('school')->get(['id', 'name', 'gender', 'school_id', 'job_title']),
        ]);
    }

    public function update(Request $request, ProgramGroup $group)
    {
        $validated = $request->validate([
            'trainer_id' => 'nullable|exists:trainers,id',
            'training_hall_id' => 'nullable|exists:training_halls,id',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,mixed',
            'status' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $group->update($validated);

        return back()->with('success', 'تم تحديث المجموعة بنجاح');
    }

    public function destroy(ProgramGroup $group)
    {
        $group->delete();
        return redirect()->route('groups.index')->with('success', 'تم حذف المجموعة بنجاح');
    }

    public function addTrainee(Request $request, ProgramGroup $group)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        Trainee::firstOrCreate([
            'program_group_id' => $group->id,
            'employee_id' => $validated['employee_id'],
        ]);

        return back()->with('success', 'تم إضافة المتدرب بنجاح');
    }

    public function removeTrainee(ProgramGroup $group, Trainee $trainee)
    {
        $trainee->delete();
        return back()->with('success', 'تم إزالة المتدرب بنجاح');
    }

    public function generateSessions(Request $request, ProgramGroup $group)
    {
        $mode = $request->input('mode', 'manual'); // 'manual' or 'weekly'

        if ($mode === 'weekly') {
            return $this->generateWeeklySessions($request, $group);
        }

        $validated = $request->validate([
            'dates' => 'required|array|min:1',
            'dates.*' => 'nullable|date',
        ]);

        $validDates = array_filter($validated['dates'], fn($d) => !empty($d));

        return $this->createSessionsFromDates($group, $validDates);
    }

    protected function generateWeeklySessions(Request $request, ProgramGroup $group)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'session_count' => 'required|integer|min:1|max:100',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $sessionCount = (int) $validated['session_count'];
        $holidayDates = OfficialHoliday::getAllHolidayDates();

        $dates = [];
        $current = $startDate->copy();
        $maxIterations = $sessionCount * 4; // Safety limit
        $iterations = 0;

        while (count($dates) < $sessionCount && $iterations < $maxIterations) {
            $dateStr = $current->format('Y-m-d');

            // Skip if it's a holiday or Friday (weekend)
            if (!in_array($dateStr, $holidayDates) && $current->dayOfWeek !== Carbon::FRIDAY) {
                $dates[] = $dateStr;
            }

            $current->addWeek();
            $iterations++;
        }

        return $this->createSessionsFromDates($group, $dates);
    }

    protected function createSessionsFromDates(ProgramGroup $group, array $validDates)
    {
        // Check for hall conflicts before proceeding
        $conflicts = [];
        if ($group->training_hall_id) {
            foreach ($validDates as $date) {
                $conflicting = TrainingSession::where('training_hall_id', $group->training_hall_id)
                    ->where('program_group_id', '!=', $group->id)
                    ->whereDate('date', $date)
                    ->where('status', '!=', 'cancelled')
                    ->with('programGroup.package.program')
                    ->first();

                if ($conflicting) {
                    $programName = $conflicting->programGroup?->package?->program?->name ?? '';
                    $groupName = $conflicting->programGroup?->name ?? '';
                    $conflicts[] = Carbon::parse($date)->format('Y-m-d') . " ({$programName} - {$groupName})";
                }
            }
        }

        $group->trainingSessions()->delete();

        $dayNumber = 1;
        $startDate = null;
        $endDate = null;

        foreach ($validDates as $date) {
            $sessionDate = Carbon::parse($date);

            if (!$startDate || $sessionDate->lt($startDate)) {
                $startDate = $sessionDate->copy();
            }
            if (!$endDate || $sessionDate->gt($endDate)) {
                $endDate = $sessionDate->copy();
            }

            TrainingSession::create([
                'program_group_id' => $group->id,
                'training_hall_id' => $group->training_hall_id,
                'trainer_id' => $group->trainer_id,
                'date' => $sessionDate,
                'day_number' => $dayNumber,
                'status' => 'scheduled',
            ]);
            $dayNumber++;
        }

        if ($startDate && $endDate) {
            $group->update([
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);
        }

        if (!empty($conflicts)) {
            $conflictList = implode('، ', $conflicts);
            return back()->with('warning', "تم توليد {$dayNumber} جلسة، لكن يوجد تعارض في القاعة بالتواريخ التالية: {$conflictList}");
        }

        return back()->with('success', "تم توليد " . ($dayNumber - 1) . " جلسة بنجاح");
    }

    public function updateSession(Request $request, TrainingSession $session)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $session->update($validated);

        return back()->with('success', 'تم تحديث الجلسة بنجاح');
    }
}
