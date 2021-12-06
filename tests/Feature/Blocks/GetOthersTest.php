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

class GetOthersTest extends TestCase
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
}
