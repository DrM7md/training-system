<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSession extends Model
{
    protected $table = 'training_sessions';

    protected $fillable = [
        'program_group_id', 'training_hall_id', 'trainer_id',
        'date', 'start_time', 'end_time', 'day_number', 'status', 'postponed_to', 'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'postponed_to' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function programGroup(): BelongsTo
    {
        return $this->belongsTo(ProgramGroup::class);
    }

    public function trainingHall(): BelongsTo
    {
        return $this->belongsTo(TrainingHall::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOnDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
