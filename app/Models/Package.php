<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    protected $fillable = ['program_id', 'name', 'description', 'hours', 'days', 'supervisor_id'];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function programGroups(): HasMany
    {
        return $this->hasMany(ProgramGroup::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(ProgramGroup::class);
    }
}
