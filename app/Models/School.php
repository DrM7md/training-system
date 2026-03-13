<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    protected $fillable = ['name', 'principal_name', 'code', 'type', 'education_level', 'district', 'phone', 'landline', 'email', 'address', 'is_active', 'academic_year_id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function trainees(): HasMany
    {
        return $this->hasMany(Trainee::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
