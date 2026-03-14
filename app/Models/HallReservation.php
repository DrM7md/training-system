<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HallReservation extends Model
{
    protected $fillable = ['training_hall_id', 'reserved_by', 'purpose', 'start_date', 'end_date', 'notes'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function trainingHall(): BelongsTo
    {
        return $this->belongsTo(TrainingHall::class);
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by');
    }
}
