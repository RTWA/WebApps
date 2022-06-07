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

class GetSharedTest extends TestCase
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

    public function testUserHasNoSharedBlocks()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/blocks/shared');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "No blocks found."
        ]);
    }

    public function testUserCanGetSharedBlocks()
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
            'owner' => 10,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
        ]);
        $block->shares()->attach(1);

        $response = $this->getJson('/api/blocks/shared');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 1
        ]);
    }

    public function testUserCanGetSharedBlocksSortedByCreatedDESC()
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
            'owner' => 10,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test']),
            'publicId' => 'PHPUnitTest',
            'title' => 'PHP Unit Test Block',
            'notes' => 'This block was created for testing',
            'created_at' => '1990-01-01 00:00:00',
        ]);
        $block2 = Block::create([
            'owner' => 10,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'PHPUnit Sample Plugin Test 2']),
            'publicId' => 'PHPUnitTest2',
            'title' => 'PHP Unit Test Block2',
            'notes' => 'This block was created for testing a second block',
            'created_at' => '2020-01-01 00:00:00',
        ]);
        $block1->shares()->attach(1);
        $block2->shares()->attach(1);

        $sort = json_encode(['by' => 'Created', 'order' => 'DESC']);
        $response = $this->getJson('/api/blocks/shared?limit=2&offset=0&filter=&sort=' . $sort);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 2
        ]);
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][0]['id'] == $block1->id
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][1]['id'] == $block2->id
        );
    }

    public function testUserCanGetSharedBlocksSortedByPopularityASC()
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
        $block1->shares()->attach(1);
        $block2->shares()->attach(1);
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

        $sort = json_encode(['by' => 'Popularity', 'order' => 'ASC']);
        $response = $this->getJson('/api/blocks/shared?limit=2&offset=0&filter=&sort=' . $sort);

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

    public function testUserCanGetSharedBlocksSortedByPopularityDESC()
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
        $block1->shares()->attach(1);
        $block2->shares()->attach(1);
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

        $sort = json_encode(['by' => 'Popularity', 'order' => 'DESC']);
        $response = $this->getJson('/api/blocks/shared?limit=2&offset=0&filter=&sort=' . $sort);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total' => 2
        ]);
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][0]['id'] == $block2->id
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][0]['views'] == 1
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][1]['id'] == $block1->id
        );
        $this->assertTrue(
            $response->decodeResponseJson()['blocks'][1]['views'] == 2
        );
    }

    public function testUnauthenticatedUserCannotGetSharedBlocks()
    {
        $this->seed();

        $response = $this->getJson('/api/blocks/shared');

        $response->assertStatus(401);
    }

    public function testUserCannotGetSharedBlocksWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/blocks/shared');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to access this page.'
        ]);
    }
}
