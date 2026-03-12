<?php

namespace App\Http\Controllers;

use App\Models\DropdownOption;
use App\Models\MeetingBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeetingBookingController extends Controller
{
    public function index()
    {
        $bookings = MeetingBooking::with('booker:id,name')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn($b) => [
                'id'         => $b->id,
                'hall_name'  => $b->hall_name,
                'booked_by'  => $b->booked_by,
                'booker'     => $b->booker,
                'date'       => $b->date->format('Y-m-d'),
                'start_time' => $b->start_time,
                'end_time'   => $b->end_time,
                'notes'      => $b->notes,
            ]);

        return Inertia::render('MeetingCalendar/Index', [
            'bookings' => $bookings,
            'users'    => User::orderBy('name')->get(['id', 'name']),
            'halls'    => DropdownOption::getOptions('meeting_halls'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hall_name'  => 'required|string',
            'booked_by'  => 'required|exists:users,id',
            'date'       => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
            'notes'      => 'nullable|string|max:500',
        ], [
            'end_time.after' => 'وقت الانتهاء يجب أن يكون بعد وقت البداية',
        ]);

        if (MeetingBooking::hasConflict($data['hall_name'], $data['date'], $data['start_time'], $data['end_time'])) {
            return back()->withErrors(['conflict' => 'القاعة محجوزة في هذا الوقت، الرجاء اختيار وقت آخر.']);
        }

        MeetingBooking::create($data);

        return back()->with('success', 'تم حجز الاجتماع بنجاح');
    }

    public function update(Request $request, MeetingBooking $meetingBooking)
    {
        $data = $request->validate([
            'hall_name'  => 'required|string',
            'booked_by'  => 'required|exists:users,id',
            'date'       => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
            'notes'      => 'nullable|string|max:500',
        ], [
            'end_time.after' => 'وقت الانتهاء يجب أن يكون بعد وقت البداية',
        ]);

        if (MeetingBooking::hasConflict($data['hall_name'], $data['date'], $data['start_time'], $data['end_time'], $meetingBooking->id)) {
            return back()->withErrors(['conflict' => 'القاعة محجوزة في هذا الوقت، الرجاء اختيار وقت آخر.']);
        }

        $meetingBooking->update($data);

        return back()->with('success', 'تم تحديث الحجز بنجاح');
    }

    public function destroy(MeetingBooking $meetingBooking)
    {
        $meetingBooking->delete();

        return back()->with('success', 'تم حذف الحجز');
    }
}
