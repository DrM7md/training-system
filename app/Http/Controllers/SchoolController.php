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

        $totalCount = School::where('academic_year_id', $currentYear?->id)->count();
        $maleCount = School::where('academic_year_id', $currentYear?->id)->where('type', 'male')->count();
        $femaleCount = School::where('academic_year_id', $currentYear?->id)->where('type', 'female')->count();

        // Filtered stats (react to search/type/education_level filters)
        $hasFilters = $request->search || $request->type || $request->education_level;
        $filteredStats = null;
        if ($hasFilters) {
            $filteredQuery = School::where('academic_year_id', $currentYear?->id)
                ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
                ->when($request->type, fn($q, $t) => $q->where('type', $t))
                ->when($request->education_level, fn($q, $el) => $q->where('education_level', $el));

            $filteredStats = [
                'total' => (clone $filteredQuery)->count(),
                'male' => (clone $filteredQuery)->where('type', 'male')->count(),
                'female' => (clone $filteredQuery)->where('type', 'female')->count(),
            ];
        }

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'type', 'education_level']),
            'educationLevels' => $educationLevels,
            'currentYear' => $currentYear ? $currentYear->name : null,
            'stats' => [
                'total' => $totalCount,
                'male' => $maleCount,
                'female' => $femaleCount,
            ],
            'filteredStats' => $filteredStats,
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

    public function statistics()
    {
        $currentYear = AcademicYear::current();
        $yearId = $currentYear?->id;

        // إحصائيات حسب المرحلة والفئة
        $byLevelAndType = School::where('academic_year_id', $yearId)
            ->whereNotNull('education_level')
            ->selectRaw("education_level, type, count(*) as count")
            ->groupBy('education_level', 'type')
            ->get()
            ->groupBy('education_level')
            ->map(fn($group) => [
                'male' => $group->where('type', 'male')->sum('count'),
                'female' => $group->where('type', 'female')->sum('count'),
                'total' => $group->sum('count'),
            ]);

        // أعلى 15 مدرسة من حيث عدد المتدربين
        $topSchoolsByTrainees = School::where('academic_year_id', $yearId)
            ->withCount('trainees')
            ->orderByDesc('trainees_count')
            ->limit(15)
            ->get()
            ->map(fn($s) => [
                'name' => $s->name,
                'trainees_count' => $s->trainees_count,
                'type' => $s->type,
            ]);

        // إحصائيات عامة
        $totalSchools = School::where('academic_year_id', $yearId)->count();
        $totalMale = School::where('academic_year_id', $yearId)->where('type', 'male')->count();
        $totalFemale = School::where('academic_year_id', $yearId)->where('type', 'female')->count();
        $totalTrainees = \App\Models\Trainee::whereHas('school', fn($q) => $q->where('academic_year_id', $yearId))->count();

        // توزيع المدارس حسب المنطقة
        $byDistrict = School::where('academic_year_id', $yearId)
            ->whereNotNull('district')
            ->where('district', '!=', '')
            ->selectRaw("district, count(*) as count")
            ->groupBy('district')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('Schools/Statistics', [
            'currentYear' => $currentYear ? $currentYear->name : null,
            'byLevelAndType' => $byLevelAndType,
            'topSchoolsByTrainees' => $topSchoolsByTrainees,
            'byDistrict' => $byDistrict,
            'stats' => [
                'total' => $totalSchools,
                'male' => $totalMale,
                'female' => $totalFemale,
                'trainees' => $totalTrainees,
            ],
        ]);
    }
}
