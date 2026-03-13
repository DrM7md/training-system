<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DropdownOptionsSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            // حالات المجموعات
            ['category' => 'group_statuses', 'value' => 'scheduled', 'label' => 'مجدول', 'sort_order' => 1, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'in_progress', 'label' => 'قيد التنفيذ', 'sort_order' => 2, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'completed', 'label' => 'مكتمل', 'sort_order' => 3, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'cancelled', 'label' => 'ملغي', 'sort_order' => 4, 'is_active' => true],
            ['category' => 'group_statuses', 'value' => 'postponed', 'label' => 'مؤجل', 'sort_order' => 5, 'is_active' => true],

            // أنواع البرامج
            ['category' => 'program_types', 'value' => 'تأهيل', 'label' => 'تأهيل', 'sort_order' => 1, 'is_active' => true],
            ['category' => 'program_types', 'value' => 'ترخيص', 'label' => 'ترخيص', 'sort_order' => 2, 'is_active' => true],
            ['category' => 'program_types', 'value' => 'تطوير', 'label' => 'تطوير', 'sort_order' => 3, 'is_active' => true],
            ['category' => 'program_types', 'value' => 'أخرى', 'label' => 'أخرى', 'sort_order' => 4, 'is_active' => true],

            // أنواع التكليفات
            ['category' => 'assignment_types', 'value' => 'إعداد حقيبة', 'label' => 'إعداد حقيبة', 'rate' => 250, 'sort_order' => 1, 'is_active' => true],
            ['category' => 'assignment_types', 'value' => 'تنقيح حقيبة كامل', 'label' => 'تنقيح حقيبة كامل', 'rate' => 125, 'sort_order' => 2, 'is_active' => true],
            ['category' => 'assignment_types', 'value' => 'تنقيح حقيبة جزئي', 'label' => 'تنقيح حقيبة جزئي', 'rate' => 62.5, 'sort_order' => 3, 'is_active' => true],
            ['category' => 'assignment_types', 'value' => 'تدريب تربوي', 'label' => 'تدريب تربوي', 'rate' => 250, 'sort_order' => 4, 'is_active' => true],
            ['category' => 'assignment_types', 'value' => 'تدريب إداري', 'label' => 'تدريب إداري', 'rate' => 250, 'sort_order' => 5, 'is_active' => true],

            // قاعات الاجتماعات
            ['category' => 'meeting_halls', 'value' => 'main_hall', 'label' => 'القاعة الرئيسية', 'sort_order' => 1, 'is_active' => true],
            ['category' => 'meeting_halls', 'value' => 'meeting_room_1', 'label' => 'غرفة الاجتماعات 1', 'sort_order' => 2, 'is_active' => true],
            ['category' => 'meeting_halls', 'value' => 'meeting_room_2', 'label' => 'غرفة الاجتماعات 2', 'sort_order' => 3, 'is_active' => true],
            ['category' => 'meeting_halls', 'value' => 'vip_room', 'label' => 'قاعة كبار الزوار', 'sort_order' => 4, 'is_active' => true],
        ];

        foreach ($options as $option) {
            DB::table('dropdown_options')->updateOrInsert(
                ['category' => $option['category'], 'value' => $option['value']],
                array_merge($option, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
