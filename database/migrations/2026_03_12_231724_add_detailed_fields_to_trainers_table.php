<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('national_id')->nullable()->after('name');
            $table->string('employee_id')->nullable()->after('national_id');
            $table->string('nationality')->nullable()->after('gender');
            $table->string('employer_type')->nullable()->after('nationality');
            $table->string('employer')->nullable()->after('employer_type');
            $table->string('job_title')->nullable()->after('employer');
            $table->string('education_level')->nullable()->after('job_title');
            $table->string('academic_specialization')->nullable()->after('education_level');
            $table->unsignedSmallInteger('training_experience_years')->default(0)->after('academic_specialization');
            $table->date('experience_base_date')->nullable()->after('training_experience_years');
            $table->boolean('is_certified_trainer')->default(false)->after('experience_base_date');
            $table->boolean('can_prepare_packages')->default(false)->after('is_certified_trainer');
            $table->text('training_fields')->nullable()->after('can_prepare_packages');
            $table->string('training_gender')->nullable()->after('training_fields');
            $table->text('trainer_evaluation')->nullable()->after('training_gender');
            $table->string('cooperation_status')->nullable()->after('trainer_evaluation');
            $table->text('notes')->nullable()->after('cooperation_status');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn([
                'national_id', 'employee_id', 'nationality', 'employer_type',
                'employer', 'job_title', 'education_level', 'academic_specialization',
                'training_experience_years', 'experience_base_date',
                'is_certified_trainer', 'can_prepare_packages', 'training_fields',
                'training_gender', 'trainer_evaluation', 'cooperation_status', 'notes',
            ]);
        });
    }
};
