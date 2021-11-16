<?php

namespace Database\Seeders;

use App\Models\Block;
use App\Models\Plugin;
use App\Services\PluginsService;
use Illuminate\Database\Seeder;

class BlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Check the Sample Plugin exists!
        if (!file_exists(Plugin::path().'Sample/Plugin.php')) {
            (new PluginsService())->downloadExtract('Sample');
        }

        // Install the Sample Plugin
        $_plugin = Plugin::createFromSlug('Sample');
        Plugin::create([
            'name' => $_plugin->name,
            'icon' => $_plugin->icon,
            'slug' => 'Sample',
            'version' => $_plugin->version,
            'author' => $_plugin->author,
            'state' => true
        ]);

        Block::factory()
            ->count(100)
            ->hasViewsData(rand(0, 100))
            ->create();
    }
}
