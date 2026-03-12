<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingBooking extends Model
{
    protected $fillable = [
        'hall_name',
        'booked_by',
        'date',
        'start_time',
        'end_time',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function booker(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'booked_by');
    }

    /** تحقق من تعارض الحجز: نفس القاعة + نفس اليوم + تداخل الوقت */
    public static function hasConflict(string $hallName, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        return static::where('hall_name', $hallName)
            ->where('date', $date)
            ->where('id', '!=', $excludeId ?? 0)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })
            ->exists();
    }
}
