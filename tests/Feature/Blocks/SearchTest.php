<?php

namespace Tests\Feature\Blocks;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Models\Block;
use App\Models\Plugin;
use App\Services\PluginsService;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        if (!file_exists(storage_path('webapps/installed.json'))) {
            file_put_contents(
                storage_path('webapps/installed.json'),
                json_encode([
                    'version' => '0.0.0',
                ])
            );
        }

        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        (new PluginsService())->downloadExtract('Sample');
    }

    public function tearDown(): void
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }
        
        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        parent::tearDown();
    }

    public function testUserCanGetOwnBlocksWithComponentFilter()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $plugin = Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);
        Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks?filter=1');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }

    public function testUserCanGetOwnBlocksWithTitleSearch()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $plugin = Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);
        Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks?filter=PHP%20Unit%20Test');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }

    public function testUserCanGetOwnBlocksWithContentSearch()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $plugin = Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);
        Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Content Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks?filter=PHPUnit%20Sample%20Content%20Plugin%20Test');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }

    public function testUserCanGetOwnBlocksWithNotesSearch()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $plugin = Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);
        Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks?filter=created%20for%20testing');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }
}
