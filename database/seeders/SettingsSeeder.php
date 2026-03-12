<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'hours_per_day', 'value' => '5', 'type' => 'integer', 'group' => 'training'],

            ['key' => 'training_start_time', 'value' => '08:00', 'type' => 'time', 'group' => 'training'],
            ['key' => 'training_end_time', 'value' => '14:00', 'type' => 'time', 'group' => 'training'],
            ['key' => 'organization_name', 'value' => 'مركز التدريب', 'type' => 'string', 'group' => 'general'],
            ['key' => 'organization_logo', 'value' => '', 'type' => 'string', 'group' => 'general'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
