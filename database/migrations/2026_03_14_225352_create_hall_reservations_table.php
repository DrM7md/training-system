<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hall_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_hall_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reserved_by')->constrained('users')->cascadeOnDelete();
            $table->string('purpose');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hall_reservations');
    }
};
