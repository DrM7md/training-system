<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class OfficialHoliday extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'color',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get all holiday dates as a flat array of date strings.
     */
    public static function getAllHolidayDates(): array
    {
        $dates = [];
        foreach (static::all() as $holiday) {
            $current = Carbon::parse($holiday->start_date);
            $end = Carbon::parse($holiday->end_date);
            while ($current->lte($end)) {
                $dates[] = $current->format('Y-m-d');
                $current->addDay();
            }
        }
        return $dates;
    }
}
