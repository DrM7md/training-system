<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'academic_years.view', 'academic_years.create', 'academic_years.edit', 'academic_years.delete',
            'semesters.view', 'semesters.create', 'semesters.edit', 'semesters.delete',
            'training_halls.view', 'training_halls.create', 'training_halls.edit', 'training_halls.delete',
            'programs.view', 'programs.create', 'programs.edit', 'programs.delete', 'programs.approve',
            'packages.view', 'packages.create', 'packages.edit', 'packages.delete',
            'groups.view', 'groups.create', 'groups.edit', 'groups.delete', 'groups.schedule',
            'sessions.view', 'sessions.create', 'sessions.edit', 'sessions.delete',
            'schools.view', 'schools.create', 'schools.edit', 'schools.delete',
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'trainers.view', 'trainers.create', 'trainers.edit', 'trainers.delete',
            'trainees.view', 'trainees.create', 'trainees.edit', 'trainees.delete',
            'reports.view', 'reports.export',
            'settings.view', 'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            'users.view', 'users.create', 'users.edit',
            'academic_years.view', 'academic_years.create', 'academic_years.edit',
            'semesters.view', 'semesters.create', 'semesters.edit',
            'training_halls.view', 'training_halls.create', 'training_halls.edit', 'training_halls.delete',
            'programs.view', 'programs.create', 'programs.edit', 'programs.delete', 'programs.approve',
            'packages.view', 'packages.create', 'packages.edit', 'packages.delete',
            'groups.view', 'groups.create', 'groups.edit', 'groups.delete', 'groups.schedule',
            'sessions.view', 'sessions.create', 'sessions.edit', 'sessions.delete',
            'schools.view', 'schools.create', 'schools.edit', 'schools.delete',
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'trainers.view', 'trainers.create', 'trainers.edit', 'trainers.delete',
            'trainees.view', 'trainees.create', 'trainees.edit', 'trainees.delete',
            'reports.view', 'reports.export',
            'settings.view',
        ]);

        $supervisor = Role::firstOrCreate(['name' => 'supervisor']);
        $supervisor->givePermissionTo([
            'programs.view',
            'packages.view',
            'groups.view', 'groups.create', 'groups.edit', 'groups.schedule',
            'sessions.view', 'sessions.create', 'sessions.edit',
            'trainers.view',
            'trainees.view', 'trainees.create', 'trainees.edit',
            'reports.view',
        ]);

        $trainee = Role::firstOrCreate(['name' => 'trainee']);
        $trainee->givePermissionTo([
            'programs.view',
            'sessions.view',
        ]);

        $user = User::firstOrCreate(
            ['email' => 'admin@training.test'],
            [
                'name' => 'مدير النظام',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $user->assignRole('super_admin');
    }
}
