<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'gender',
        'job_title',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function supervisedPrograms(): HasMany
    {
        return $this->hasMany(Program::class, 'supervisor_id');
    }

    public function preparedPrograms(): HasMany
    {
        return $this->hasMany(Program::class, 'content_preparer_id');
    }

    public function supervisedPackages(): HasMany
    {
        return $this->hasMany(Package::class, 'supervisor_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
