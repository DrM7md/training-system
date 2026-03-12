<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Program extends Model
{
    protected $fillable = [
        'academic_year_id', 'name', 'description', 'type', 'status', 'hours',
        'target_audience', 'target_count', 'male_count', 'female_count',
        'supervisor_id', 'content_preparer_id', 'is_approved', 'is_archived'
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_archived' => 'boolean',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function contentPreparer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'content_preparer_id');
    }

    public function programGroups(): HasManyThrough
    {
        return $this->hasManyThrough(ProgramGroup::class, Package::class);
    }

    public function getTotalGroupsAttribute(): int
    {
        return $this->programGroups()->count();
    }
}
