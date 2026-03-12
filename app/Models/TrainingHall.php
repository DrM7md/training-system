<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingHall extends Model
{
    protected $fillable = ['name', 'capacity', 'gender_priority', 'location', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function programGroups(): HasMany
    {
        return $this->hasMany(ProgramGroup::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
