<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Models\Block;
use App\Models\BlockViews;
use App\Models\Plugin;
use App\Services\PluginsService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class BlocksTest extends TestCase
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

    public function testUserCanGetNewBlockData()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);

        $response = $this->getJson('/api/blocks/Sample?edit=true');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'owner' => 1,
            'name' => 'test_plugin',
            'message' => ''
        ]);
    }

    public function testUserCannotGetNewBlockDataWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => '',
            'version' => 'PHPUnitTestLatest',
            'author' => 'PHPUnit',
            'state' => 1
        ]);

        $response = $this->getJson('/api/blocks/Sample?edit=true');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => "You do not have permission to access this page."
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

    public function testUserCannotGetAnotherUsersBlockDataWithoutPermissionUsingAValidPublicId()
    {
        $this->seed();

        User::find(10)->assignRole('Standard Users');
        Role::findByName('Standard Users')->givePermissionTo(Permission::where('name', 'blocks.create')->first());

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

        $response = $this->getJson('/api/blocks/PHPUnitTest?edit=true');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => "You do not have permission to edit this block."
        ]);
    }

    public function testUserCanSaveChangesToTheirOwnBlock()
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

        $response = $this->putJson('/api/blocks/PHPUnitTest', [
            'block' => '{"id":' . $block->id . ',
                            "owner":9999,
                            "settings":{"message":"Sample"},
                            "notes":"This is a note",
                            "title":"This is my Block"}'
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'message' => 'Block saved successfully'
        ]);
    }

    public function testUserCannotSaveChangesToAnotherUsersBlockWithoutPermission()
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

        $response = $this->putJson('/api/blocks/PHPUnitTest', [
            'block' => '{"id":' . $block->id . ',
                            "owner":9999,
                            "settings":{"message":"Sample"},
                            "notes":"This is a note",
                            "title":"This is my Block"}'
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to edit this block.'
        ]);
    }

    public function testUserCanCreateANewBlock()
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

        $response = $this->putJson('/api/blocks/PHPUnitTest', [
            'block' => '{"owner":10,
                            "publicId":"PHPUnitTest",
                            "settings":{"message":"Sample"},
                            "notes":"This is a note",
                            "title":"This is my Block",
                            "plugin":{"id":' . $plugin->id . '}
                        }'
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'message' => 'Block saved successfully'
        ]);
    }

    public function testUserCanGetAnotherUsersBlockWithPermission()
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
            'owner' => 10,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'Belongs to another user']),
            'publicId' => 'TestID',
            'title' => 'User Block Test',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks/user/no_role');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "Belongs to another user",
            'notes' => "This block was created for testing",
            'title' => 'User Block Test'
        ]);
    }

    public function testUserCannotGetAnotherUsersBlockWithoutPermission()
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
            'settings' => json_encode(['message' => 'Belongs to another user']),
            'publicId' => 'TestID',
            'title' => 'User Block Test',
            'notes' => 'This block was created for testing',
            'views' => 10
        ]);

        $response = $this->getJson('/api/blocks/user/test_user');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to access this page.'
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

    public function testCannotGetABlockForEmbeddingThatDoesntExist()
    {
        $this->seed();

        $response = $this->get('/embed/PHPUnitTest_NonExistant');

        $response->assertStatus(404);
    }

    public function testUserCanDeleteOwnBlock()
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

        $response = $this->deleteJson('/api/blocks/PHPUnitTest');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "Block deleted"
        ]);
    }

    public function testUserCanDeleteAnotherUsersBlockWithoutPermission()
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

        $response = $this->deleteJson('/api/blocks/PHPUnitTest');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => "You do not have permission to delete this block."
        ]);
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
