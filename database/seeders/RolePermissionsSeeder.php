<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach (config('installer.create_permissions') as $permission) {
            if (!DB::table('permissions')->where('name', $permission['name'])->first()) {
                DB::table('permissions')->insert([
                    'name' => $permission['name'],
                    'title' => $permission['title'],
                    'guard_name' => $permission['guard']
                ]);
            }
        }

        if (!DB::table('roles')->where('name', 'Administrators')->first()) {
            DB::table('roles')->insert([
                // 'id' => 1,
                'name' => 'Administrators',
                'guard_name' => 'web'
            ]);
        }

        if (!DB::table('roles')->where('name', 'Standard Users')->first()) {
            DB::table('roles')->insert([
                'name' => 'Standard Users',
                'guard_name' => 'web'
            ]);
        }

        $admin = DB::table('roles')->where('name', 'Administrators')->first();
        if (!DB::table('model_has_roles')->where('model_id', 1)->first()) {
            DB::table('model_has_roles')->insert([
                'role_id' => $admin->id,
                'model_type' => 'App\Models\User',
                'model_id' => 1
            ]);
        }

        $perms = DB::table('permissions')->get();
        foreach ($perms as $perm) {
            if (!DB::table('role_has_permissions')->where('permission_id', $perm->id)->first()) {
                DB::table('role_has_permissions')->insert([
                    'permission_id' => $perm->id,
                    'role_id' => 1
                ]);
            }
        }
    }
}
