<?php

namespace Tests\Feature\Blocks;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Models\Block;
use App\Models\BlockViews;
use App\Models\Plugin;
use App\Services\PluginsService;

class GetBlockViewCountsTest extends TestCase
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

    public function testUserCanGetOwnBlockCount()
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

        $response = $this->getJson('/api/blocks/count');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'count' => 1
        ]);
    }

    public function testUserCannotGetOwnBlockCountWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/blocks/count');

        $response->assertStatus(403);
    }

    public function testUserCanGetOwnBlockViewCount()
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
        $block = Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);
        BlockViews::create([
            'block_id' => $block->id,
            'time' => now()
        ]);

        $response = $this->getJson('/api/blocks/views');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'views' => 1
        ]);
    }

    public function testUserCannotGetOwnBlockViewCountWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/blocks/views');

        $response->assertStatus(403);
    }

    public function testCanGetBlocksByBlockViewData()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
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
        $block = Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);
        $blockView = BlockViews::create([
            'block_id' => $block->id,
            'time' => now()
        ]);

        $this->assertTrue($blockView->block->id === $block->id);
    }

    public function testCanGetAUserObjectsBlocks()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
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

        $user = User::find(1);
        $this->assertTrue($user->blocks->count() === 1);
    }
}
