<?php

namespace Tests\Feature\Blocks;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Models\Block;
use App\Models\Plugin;
use App\Services\PluginsService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class GetSharedOthersTest extends TestCase
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

    public function testUserCanGetAnotherUsersSharedBlocksWithPermission()
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
            'owner' => 5,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'Belongs to another user']),
            'publicId' => 'TestID',
            'title' => 'User Block Test',
            'notes' => 'This block was created for testing',
        ]);
        $block->shares()->attach(10);

        $response = $this->getJson('/api/blocks/shared/user/no_role');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => "Belongs to another user",
            'notes' => "This block was created for testing",
            'title' => 'User Block Test'
        ]);
    }

    public function testUserCannotGetAnotherUsersSharedBlocksWithoutPermission()
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
            'owner' => 5,
            'plugin' => $plugin->id,
            'settings' => json_encode(['message' => 'Belongs to another user']),
            'publicId' => 'TestID',
            'title' => 'User Block Test',
            'notes' => 'This block was created for testing',
        ]);
        $block->shares()->attach(1);

        $response = $this->getJson('/api/blocks/shared/user/test_user');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to access this page.'
        ]);
    }
}
