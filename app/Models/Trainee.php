<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trainee extends Model
{
    protected $fillable = ['program_group_id', 'employee_id', 'school_id', 'status', 'grade', 'notes'];

    protected $casts = [
        'grade' => 'decimal:2',
    ];

    public function programGroup(): BelongsTo
    {
        return $this->belongsTo(ProgramGroup::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
