<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->boolean('is_government_employee')->default(false)->after('is_active');
            $table->string('direct_manager', 255)->nullable()->after('is_government_employee');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn(['is_government_employee', 'direct_manager']);
        });
    }
};
