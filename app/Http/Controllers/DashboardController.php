<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Employee;
use App\Models\Program;
use App\Models\ProgramGroup;
use App\Models\School;
use App\Models\Trainer;
use App\Models\TrainingHall;
use App\Models\TrainingSession;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $currentYear = AcademicYear::current();

        $stats = [
            'programs' => Program::when($currentYear, fn($q) => $q->where('academic_year_id', $currentYear?->id))->count(),
            'groups' => ProgramGroup::count(),
            'trainers' => Trainer::active()->count(),
            'trainingHalls' => TrainingHall::active()->count(),
            'schools' => School::active()->count(),
            'employees' => Employee::active()->count(),
        ];

        $todaySessions = TrainingSession::with(['programGroup.package.program', 'trainingHall', 'trainer'])
            ->whereDate('date', today())
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'program' => $session->programGroup?->package?->program?->name ?? '-',
                'package' => $session->programGroup?->package?->name ?? '-',
                'group' => $session->programGroup?->name ?? '-',
                'hall' => $session->trainingHall?->name ?? '-',
                'trainer' => $session->trainer?->name ?? '-',
                'status' => $session->status,
                'day_number' => $session->day_number,
            ]);

        $hallsStatus = TrainingHall::active()
            ->withCount(['trainingSessions as busy_today' => function ($q) {
                $q->whereDate('date', today())->where('status', '!=', 'cancelled');
            }])
            ->get()
            ->map(fn($hall) => [
                'id' => $hall->id,
                'name' => $hall->name,
                'capacity' => $hall->capacity,
                'is_busy' => $hall->busy_today > 0,
            ]);

        $upcomingSessions = TrainingSession::with(['programGroup.package.program', 'trainingHall'])
            ->where('date', '>', today())
            ->where('date', '<=', today()->addDays(7))
            ->orderBy('date')
            ->limit(10)
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'program' => $session->programGroup?->package?->program?->name ?? '-',
                'group' => $session->programGroup?->name ?? '-',
                'hall' => $session->trainingHall?->name ?? '-',
                'date' => $session->date->format('Y-m-d'),
                'day_name' => $session->date->translatedFormat('l'),
            ]);

        $recentPrograms = Program::with('supervisor')
            ->when($currentYear, fn($q) => $q->where('academic_year_id', $currentYear?->id))
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($program) => [
                'id' => $program->id,
                'name' => $program->name,
                'type' => $program->type,
                'supervisor' => $program->supervisor?->name ?? '-',
                'status' => $program->status,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todaySessions' => $todaySessions,
            'hallsStatus' => $hallsStatus,
            'upcomingSessions' => $upcomingSessions,
            'recentPrograms' => $recentPrograms,
            'currentYear' => $currentYear ? [
                'id' => $currentYear->id,
                'name' => $currentYear->name,
            ] : null,
        ]);
    }
}
