<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'is_current'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class)->orderBy('order');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public static function current(): ?self
    {
        return self::where('is_current', true)->first();
    }

    public function setCurrent(): void
    {
        self::query()->update(['is_current' => false]);
        $this->update(['is_current' => true]);
    }
}
