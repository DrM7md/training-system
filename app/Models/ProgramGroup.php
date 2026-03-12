<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramGroup extends Model
{
    protected $fillable = [
        'package_id', 'semester_id', 'trainer_id', 'training_hall_id',
        'name', 'gender', 'capacity', 'start_date', 'end_date', 'status', 'notes'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function trainingHall(): BelongsTo
    {
        return $this->belongsTo(TrainingHall::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class)->orderBy('date');
    }

    public function trainees(): HasMany
    {
        return $this->hasMany(Trainee::class);
    }

    public function getTraineesCountAttribute(): int
    {
        return $this->trainees()->count();
    }

    public function program()
    {
        return $this->package->program();
    }
}
