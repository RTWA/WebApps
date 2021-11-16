<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach (config('installer.create_settings') as $setting) {
            if (!DB::table('settings')->where('key', $setting['key'])->first()) {
                DB::table('settings')->insert([
                    'key' => $setting['key'],
                    'value' => $setting['value'],
                ]);
            }
        };
    }
}
