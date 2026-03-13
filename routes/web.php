<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProgramGroupController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\DropdownOptionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\TrainingHallController;
use App\Http\Controllers\MeetingBookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ImportController;
use App\Exports\ProgramsExport;
use App\Exports\PackagesExport;
use App\Exports\GroupsExport;
use App\Exports\TrainersExport;
use App\Exports\TrainersTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('academic-years', AcademicYearController::class)->except(['create', 'edit', 'show']);
    Route::post('academic-years/{academicYear}/set-current', [AcademicYearController::class, 'setCurrent'])->name('academic-years.set-current');
    
    Route::resource('semesters', SemesterController::class)->only(['store', 'update', 'destroy']);

    Route::resource('training-halls', TrainingHallController::class)->except(['create', 'edit']);

    Route::resource('programs', ProgramController::class)->except(['create', 'edit']);
    Route::post('programs/{program}/toggle-archive', [ProgramController::class, 'toggleArchive'])->name('programs.toggle-archive');

    Route::resource('packages', PackageController::class)->except(['create', 'edit']);

    Route::resource('groups', ProgramGroupController::class)->except(['create', 'edit']);
    Route::post('groups/{group}/trainees', [ProgramGroupController::class, 'addTrainee'])->name('groups.trainees.add');
    Route::delete('groups/{group}/trainees/{trainee}', [ProgramGroupController::class, 'removeTrainee'])->name('groups.trainees.remove');
    Route::post('groups/{group}/generate-sessions', [ProgramGroupController::class, 'generateSessions'])->name('groups.generate-sessions');
    Route::put('sessions/{session}', [ProgramGroupController::class, 'updateSession'])->name('sessions.update');

    Route::get('schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::post('schedule/sessions', [ScheduleController::class, 'storeSession'])->name('schedule.sessions.store');
    Route::patch('schedule/sessions/{session}', [ScheduleController::class, 'updateSession'])->name('schedule.sessions.update');
    Route::patch('schedule/sessions/{session}/move', [ScheduleController::class, 'moveSession'])->name('schedule.sessions.move');

    Route::resource('schools', SchoolController::class)->except(['create', 'edit', 'show']);
    Route::post('schools/bulk', [SchoolController::class, 'bulkStore'])->name('schools.bulk-store');

    Route::resource('employees', EmployeeController::class)->except(['create', 'edit']);

    Route::resource('trainers', TrainerController::class)->except(['create', 'edit']);

    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);

    Route::resource('roles', RoleController::class)->except(['create', 'edit', 'show']);

    Route::resource('meeting-bookings', MeetingBookingController::class)->except(['create', 'edit', 'show']);

    Route::resource('assignments', AssignmentController::class)->except(['create', 'edit']);
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('certificates', fn() => \Inertia\Inertia::render('Certificates/Index'))->name('certificates.index');

    Route::get('export/programs', fn() => Excel::download(new ProgramsExport, 'البرامج_التدريبية.xlsx'))->name('export.programs');
    Route::get('export/packages', fn() => Excel::download(new PackagesExport, 'الحقائب_التدريبية.xlsx'))->name('export.packages');
    Route::get('export/groups', fn() => Excel::download(new GroupsExport, 'المجموعات.xlsx'))->name('export.groups');
    Route::get('export/trainers', fn() => Excel::download(new TrainersExport, 'المدربين.xlsx'))->name('export.trainers');
    Route::get('export/trainers-template', fn() => Excel::download(new TrainersTemplateExport, 'قالب_استيراد_المدربين.xlsx'))->name('export.trainers-template');
    Route::post('import/trainers', [ImportController::class, 'trainers'])->name('import.trainers');

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('dropdown-options/{category}', [DropdownOptionController::class, 'index'])->name('dropdown-options.index');
    Route::post('dropdown-options', [DropdownOptionController::class, 'store'])->name('dropdown-options.store');
    Route::put('dropdown-options/{dropdownOption}', [DropdownOptionController::class, 'update'])->name('dropdown-options.update');
    Route::delete('dropdown-options/{dropdownOption}', [DropdownOptionController::class, 'destroy'])->name('dropdown-options.destroy');
    Route::post('dropdown-options/reorder', [DropdownOptionController::class, 'reorder'])->name('dropdown-options.reorder');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
