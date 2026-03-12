<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::withCount(['semesters', 'programs'])
            ->orderByDesc('is_current')
            ->orderByDesc('start_date')
            ->paginate(10);

        return Inertia::render('AcademicYears/Index', [
            'academicYears' => $academicYears,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        $year = AcademicYear::create($validated);

        if ($request->is_current) {
            $year->setCurrent();
        }

        return back()->with('success', 'تم إضافة العام الدراسي بنجاح');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        $academicYear->update($validated);

        if ($request->is_current) {
            $academicYear->setCurrent();
        }

        return back()->with('success', 'تم تحديث العام الدراسي بنجاح');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return back()->with('success', 'تم حذف العام الدراسي بنجاح');
    }

    public function setCurrent(AcademicYear $academicYear)
    {
        $academicYear->setCurrent();
        return back()->with('success', 'تم تعيين العام الدراسي الحالي');
    }
}
