<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index(Request $request)
    {
        $schools = School::withCount(['employees', 'trainees'])
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:schools,code',
            'type' => 'required|in:male,female,mixed',
            'district' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        School::create($validated);

        return back()->with('success', 'تم إضافة المدرسة بنجاح');
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'names' => 'required|string',
            'type' => 'required|in:male,female,mixed',
        ]);

        $names = array_filter(array_map('trim', explode("\n", $request->names)));
        $count = 0;

        foreach ($names as $name) {
            if ($name && !School::where('name', $name)->exists()) {
                School::create([
                    'name' => $name,
                    'type' => $request->type,
                    'is_active' => true,
                ]);
                $count++;
            }
        }

        return back()->with('success', "تم إضافة {$count} مدرسة بنجاح");
    }

    public function update(Request $request, School $school)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:schools,code,' . $school->id,
            'type' => 'required|in:male,female,mixed',
            'district' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
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
