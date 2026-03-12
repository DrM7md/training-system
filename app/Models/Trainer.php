<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'gender', 'specialization', 'bio', 'is_internal', 'is_active'];

    protected $casts = [
        'is_internal' => 'boolean',
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

    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    public function scopeExternal($query)
    {
        return $query->where('is_internal', false);
    }
}
