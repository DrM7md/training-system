<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'order' => 'integer|min:1',
        ]);

        Semester::create($validated);

        return back()->with('success', 'تم إضافة الفصل الدراسي بنجاح');
    }

    public function update(Request $request, Semester $semester)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'order' => 'integer|min:1',
        ]);

        $semester->update($validated);

        return back()->with('success', 'تم تحديث الفصل الدراسي بنجاح');
    }

    public function destroy(Semester $semester)
    {
        $semester->delete();
        return back()->with('success', 'تم حذف الفصل الدراسي بنجاح');
    }
}
