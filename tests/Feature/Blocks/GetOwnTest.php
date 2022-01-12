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

class GetOwnTest extends TestCase
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

    public function testUserHasNoBlocks()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/blocks');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "No blocks found."
        ]);
    }

    public function testUserCanGetOwnBlocks()
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

        $response = $this->getJson('/api/blocks');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }

    public function testUserCanGetOwnBlocksButOneIsNoLongerAvailable()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        Block::create([
            'owner' => 1,
            'plugin' => 999,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
        $response->assertJsonFragment([
            'output' => '<div class="text-red-500">This Plugin is no longer available</div>'
        ]);
    }

    public function testUserCanGetOwnBlocksSortedByPopularity()
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
        $block1 = Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);
        $block2 = Block::create([
            'owner' => 1,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test 2']),
            'publicId' => 'PHPUnitTest2',
            'title' => 'PHP Unit Test Block2',
            'notes' => 'This block was created for testing a second block',
            'views' => 10
        ]);
        BlockViews::create([
            'block_id' => $block1->id,
            'time' => now()->subMinutes(10)
        ]);
        BlockViews::create([
            'block_id' => $block1->id,
            'time' => now()->subMinutes(12)
        ]);
        BlockViews::create([
            'block_id' => $block2->id,
            'time' => now()->subMinutes(11)
        ]);

        $response = $this->getJson('/api/blocks?limit=2&offset=0&filter=&sort=views');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 2
        ]);
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][0]['id'] == $block1->id
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][0]['views'] == 2
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][1]['id'] == $block2->id
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][1]['views'] == 1
        );
    }

    public function testUnauthenticatedUserCannotGetOwnBlocks()
    {
        $this->seed();

        $response = $this->getJson('/api/blocks');

        $response->assertStatus(401);
    }

    public function testUserCannotGetOwnBlocksWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/blocks');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to access this page.'
        ]);
    }

    public function testUserCannotGetBlockDataWithAnInvalidPublicId()
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

        $response = $this->getJson('/api/blocks/InvalidID?edit=true');

        $response->assertStatus(406);
        $response->assertJsonFragment([
            'message' => "View (InvalidID) not found. Please check and try again."
        ]);
    }

    public function testUserCanGetBlockDataWithAValidPublicId()
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

        $response = $this->getJson('/api/blocks/PHPUnitTest?edit=true');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "PHPUnit Sample Plugin Test",
            'notes' => "This block was created for testing",
            'title' => 'PHP Unit Test Block'
        ]);
    }

    public function testUserCannotGetBlockDataWithAValidPublicIdButMissingPlugin()
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
            'plugin' => $plugin->id + 1,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks/PHPUnitTest?edit=true');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'block' => 'Not available'
        ]);
    }

    public function testCanGetABlockForEmbedding()
    {
        $this->seed();

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

        $response = $this->get('/embed/PHPUnitTest');

        $response->assertStatus(200);
    }

    public function testCanGetAnOrphanedBlockForEmbedding()
    {
        $this->seed();

        Block::create([
            'owner' => 1,
            'plugin' => 40,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->get('/embed/PHPUnitTest');

        $response->assertStatus(200);
        $response->assertViewIs('not-available');
    }

    public function testCannotGetABlockForEmbeddingThatDoesntExist()
    {
        $this->seed();

        $response = $this->get('/embed/PHPUnitTest_NonExistant');

        $response->assertStatus(404);
    }
}
