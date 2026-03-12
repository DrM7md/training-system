<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->where('key', 'default_group_capacity')->delete();
    }

    public function down(): void
    {
        DB::table('settings')->insert([
            'key' => 'default_group_capacity',
            'value' => '25',
            'type' => 'integer',
            'group' => 'training',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
