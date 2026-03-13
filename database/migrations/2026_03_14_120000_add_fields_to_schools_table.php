<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('education_level')->nullable()->after('type');
            $table->string('landline', 100)->nullable()->after('phone');
            $table->foreignId('academic_year_id')->nullable()->after('is_active')
                ->constrained('academic_years')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn(['education_level', 'landline', 'academic_year_id']);
        });
    }
};
