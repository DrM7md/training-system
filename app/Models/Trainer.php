<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    protected $fillable = [
        'name', 'national_id', 'employee_id', 'email', 'phone', 'gender',
        'nationality', 'employer_type', 'employer', 'job_title',
        'education_level', 'academic_specialization', 'specialization', 'bio',
        'training_experience_years', 'experience_base_date',
        'is_certified_trainer', 'can_prepare_packages', 'training_fields',
        'training_gender', 'trainer_evaluation', 'cooperation_status',
        'is_internal', 'is_active', 'is_government_employee', 'direct_manager', 'notes',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'is_active' => 'boolean',
        'is_certified_trainer' => 'boolean',
        'can_prepare_packages' => 'boolean',
        'is_government_employee' => 'boolean',
        'experience_base_date' => 'date',
        'training_experience_years' => 'integer',
    ];

    protected $appends = ['current_experience_years', 'nationality_category'];

    protected function currentExperienceYears(): Attribute
    {
        return Attribute::get(function () {
            if (!$this->experience_base_date) {
                return $this->training_experience_years ?? 0;
            }
            $yearsPassed = (int) $this->experience_base_date->diffInYears(Carbon::now());
            return ($this->training_experience_years ?? 0) + $yearsPassed;
        });
    }

    protected function nationalityCategory(): Attribute
    {
        return Attribute::get(function () {
            if (!$this->nationality) {
                return null;
            }
            return $this->nationality === 'قطر' ? 'قطري' : 'غير قطري';
        });
    }

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
