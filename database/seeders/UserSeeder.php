<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if (App::environment() == 'testing') {
            DB::table('users')->insert([
                'id' => 1,
                'name' => 'Test User',
                'username' => 'test_user',
                'email' => 'test@test.com',
                'password' => Hash::make('1234'),
                'active' => true,
            ]);
            DB::table('users')->insert([
                'id' => 5,
                'name' => 'Test Standard User',
                'username' => 'standard',
                'email' => 'standard@test.com',
                'password' => Hash::make('1234'),
                'active' => true,
            ]);
            DB::table('users')->insert([
                'id' => 10,
                'name' => 'Test NoRole User',
                'username' => 'no_role',
                'email' => 'norole@test.com',
                'password' => Hash::make('1234'),
                'active' => true,
            ]);
            DB::table('users')->insert([
                'id' => 100,
                'name' => 'Test disabled User',
                'username' => 'no_role1',
                'email' => 'norole1@test.com',
                'password' => Hash::make('1234'),
                'active' => false,
            ]);
        } else {
            DB::table('users')->insert([
                // 'id' => 1,
                'name' => 'WebApps Administrator',
                'username' => 'administrator',
                'email' => 'administrator@webapps.local',
                'password' => Hash::make('password'),
                'active' => true
            ]);
            $user = User::where('username', 'administrator')->first();
            $user->assignRole('Administrators');

            $users = User::factory()
                        ->count(100)
                        ->create();

            foreach ($users as $user) {
                if ($user->name <> 'WebApps Administrator') {
                    $user->assignRole('Standard Users');
                }
            }
        }
    }
}
