<?php

namespace App\Http\Controllers;

use App\Models\OfficialHoliday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfficialHolidayController extends Controller
{
    public function index()
    {
        $holidays = OfficialHoliday::orderBy('start_date', 'desc')->get();

        return Inertia::render('OfficialHolidays/Index', [
            'holidays' => $holidays,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'color' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        OfficialHoliday::create($validated);

        return back()->with('success', 'تم إضافة الإجازة بنجاح');
    }

    public function update(Request $request, OfficialHoliday $officialHoliday)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'color' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        $officialHoliday->update($validated);

        return back()->with('success', 'تم تحديث الإجازة بنجاح');
    }

    public function destroy(OfficialHoliday $officialHoliday)
    {
        $officialHoliday->delete();

        return back()->with('success', 'تم حذف الإجازة بنجاح');
    }
}
