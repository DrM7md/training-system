<?php

namespace Database\Seeders;

use App\Models\TrainingHall;
use Illuminate\Database\Seeder;

class TrainingHallSeeder extends Seeder
{
    public function run(): void
    {
        $halls = [
            ['name' => 'القاعة 1', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 2', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 3', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 4', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 5', 'capacity' => 30, 'gender_priority' => 'male'],
            ['name' => 'القاعة 6', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 7', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 8', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 9', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 10', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 11', 'capacity' => 30, 'gender_priority' => 'male'],
            ['name' => 'القاعة 12', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 13', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 14', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 15', 'capacity' => 25, 'gender_priority' => 'male'],
            ['name' => 'القاعة 16', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 17', 'capacity' => 25, 'gender_priority' => 'female'],
            ['name' => 'القاعة 18', 'capacity' => 20, 'gender_priority' => 'female'],
            ['name' => 'القاعة 19', 'capacity' => 30, 'gender_priority' => 'all'],
            ['name' => 'القاعة 20', 'capacity' => 30, 'gender_priority' => 'all'],
            ['name' => 'واحة المعرفة', 'capacity' => 35, 'gender_priority' => null],
            ['name' => 'القاعة المتعددة', 'capacity' => 40, 'gender_priority' => null],
            ['name' => 'المسرح', 'capacity' => 60, 'gender_priority' => null],
            ['name' => 'القاعة الرياضية', 'capacity' => 100, 'gender_priority' => null],
            ['name' => 'معمل الحاسب 1', 'capacity' => 20, 'gender_priority' => null],
            ['name' => 'معمل الحاسب 2', 'capacity' => 20, 'gender_priority' => null],
            ['name' => 'معمل الحاسب 3', 'capacity' => 20, 'gender_priority' => null],
            ['name' => 'معمل العلوم 1', 'capacity' => 16, 'gender_priority' => null],
            ['name' => 'معمل العلوم 2', 'capacity' => 16, 'gender_priority' => null],
            ['name' => 'الكافتيريا 1', 'capacity' => 80, 'gender_priority' => null],
            ['name' => 'معمل الفنون 2', 'capacity' => null, 'gender_priority' => null],
            ['name' => 'الكافتيريا 2', 'capacity' => 30, 'gender_priority' => null],
        ];

        foreach ($halls as $hall) {
            TrainingHall::updateOrCreate(
                ['name' => $hall['name']],
                [
                    'capacity' => $hall['capacity'] ?? 0,
                    'gender_priority' => $hall['gender_priority'],
                    'is_active' => true,
                ]
            );
        }
    }
}
