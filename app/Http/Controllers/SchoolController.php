<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current();

        $schools = School::withCount(['employees', 'trainees'])
            ->where('academic_year_id', $currentYear?->id)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->education_level, fn($q, $el) => $q->where('education_level', $el))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $educationLevels = School::where('academic_year_id', $currentYear?->id)
            ->whereNotNull('education_level')
            ->distinct()
            ->orderBy('education_level')
            ->pluck('education_level');

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'type', 'education_level']),
            'educationLevels' => $educationLevels,
            'currentYear' => $currentYear ? $currentYear->name : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'type' => 'required|in:male,female',
            'district' => 'nullable|string|max:255',
            'principal_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:100',
            'landline' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $currentYear = AcademicYear::current();
        $validated['academic_year_id'] = $currentYear?->id;

        School::create($validated);

        return back()->with('success', 'تم إضافة المدرسة بنجاح');
    }

    public function update(Request $request, School $school)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'type' => 'required|in:male,female',
            'district' => 'nullable|string|max:255',
            'principal_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:100',
            'landline' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $school->update($validated);

        return back()->with('success', 'تم تحديث المدرسة بنجاح');
    }

    public function destroy(School $school)
    {
        $school->delete();
        return back()->with('success', 'تم حذف المدرسة بنجاح');
    }
}
