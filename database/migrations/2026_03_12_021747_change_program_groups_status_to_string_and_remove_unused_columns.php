<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change status from enum to string
        DB::statement("ALTER TABLE program_groups MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'scheduled'");

        // Seed the group_statuses dropdown options
        $statuses = [
            ['category' => 'group_statuses', 'value' => 'scheduled', 'label' => 'مجدول', 'sort_order' => 1, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'in_progress', 'label' => 'قيد التنفيذ', 'sort_order' => 2, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'completed', 'label' => 'مكتمل', 'sort_order' => 3, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'cancelled', 'label' => 'ملغي', 'sort_order' => 4, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'postponed', 'label' => 'مؤجل', 'sort_order' => 5, 'is_active' => true],
        ];

        foreach ($statuses as $status) {
            DB::table('dropdown_options')->updateOrInsert(
                ['category' => $status['category'], 'value' => $status['value']],
                array_merge($status, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE program_groups MODIFY COLUMN status ENUM('scheduled','in_progress','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled'");
        DB::table('dropdown_options')->where('category', 'group_statuses')->delete();
    }
};
