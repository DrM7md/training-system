<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['registered', 'attended', 'absent', 'withdrawn', 'completed'])->default('registered');
            $table->decimal('grade', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['program_group_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainees');
    }
};
