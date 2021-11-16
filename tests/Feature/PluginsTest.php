<?php

namespace Tests\Feature;

use App\Models\Block;
use App\Models\Plugin;
use App\Models\User;
use App\Services\PluginsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PluginsTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');
    }

    public function testAUniquePublicIdIsGenerated()
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

        $publicId = Plugin::idUnique('PHPUnitTest');

        $this->assertTrue($publicId <> 'PHPUnitTest');
    }

    public function testCanGetListOfAllPlugins()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/plugins');

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCanGetListOfActivePlugins()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => 1
        ]);

        $response = $this->getJson('/api/plugins/active');

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCannotGetListOfActivePluginsWithoutPermissionToCreateBlocks()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/plugins/active');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to access this page'
        ]);
    }

    public function testCanDisableAnActivePlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => true
        ]);

        (new PluginsService())->downloadExtract('Sample');

        $response = $this->postJson('/api/plugins/toggle', [
            'slug' => 'Sample'
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'success' => true,
            'message' => "Plugin updated",
            'state' => false
        ]);
    }

    public function testCanInstallAndEnableANewPlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        (new PluginsService())->downloadExtract('Sample');
        
        $response = $this->postJson('/api/plugins/toggle', [
            'slug' => 'Sample'
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'success' => true,
            'message' => "Plugin updated",
            'slug' => 'Sample',
            'state' => true
        ]);
    }

    public function testCannotInstallAPluginThatDoesNotExist()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        (new PluginsService())->downloadExtract('Sample');
        
        $response = $this->postJson('/api/plugins/toggle', [
            'slug' => 'TestPlugin'
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        $response->assertStatus(500);
        $response->assertJsonFragment([
            'message' => "Unable to load Plugin: TestPlugin"
        ]);
    }

    public function testCanGetAListOfOnlinePlugins()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/online/plugins/list');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'plugins'
        ]);
    }

    public function testCannotGetAListOfOnlinePluginsWithoutAdminAccessPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/online/plugins/list');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to install Plugins'
        ]);
    }

    public function testCanDownloadAPlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/online/plugins/download', [
            'slug' => 'Sample'
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Plugin downloaded'
        ]);
    }

    public function testCannotDownloadAPluginThatDoesNotExist()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/online/plugins/download', [
            'slug' => 'ThisPluginDoesNotExist'
        ]);

        $response->assertStatus(404);
    }

    public function testCanDownloadAnUpdateForAPlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'state' => true
        ]);

        $response = $this->postJson('/api/online/plugins/download', [
            'slug' => 'Sample'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'plugins'
        ]);
        $response->assertJsonMissing([
            'version' => 'PHPUnitLatestVersion'
        ]);
    }

    public function testCanUninstallAnUnusedAndDeactivatedPlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => false
        ]);

        (new PluginsService())->downloadExtract('Sample');
        
        $response = $this->deleteJson('/api/plugin', [
            'slug' => 'Sample'
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Plugin has been uninstalled'
        ]);
    }

    public function testCannotUninstallAnUnusedButActivePlugin()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => true
        ]);

        $response = $this->deleteJson('/api/plugin', [
            'slug' => 'Sample'
        ]);

        $response->assertStatus(406);
        $response->assertJsonFragment([
            'message' => 'Plugin is active. Are you sure you wish to deactivate and uninstall it?'
        ]);
    }

    public function testCanUninstallAnUnusedButActivePluginAfterConfirming()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => true
        ]);

        (new PluginsService())->downloadExtract('Sample');
        
        $response = $this->deleteJson('/api/plugin', [
            'slug' => 'Sample',
            'confirm' => true
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            (new PluginsService())->rrmdir(Plugin::path() . 'Sample');
        }

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'Plugin has been uninstalled'
        ]);
    }

    public function testCannotUninstallAPluginThatIsInUse()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $plugin = Plugin::create([
            'name' => 'test_plugin',
            'slug' => 'Sample',
            'icon' => 'star',
            'version' => '1.0.0-alpha',
            'author' => 'PHPUnit',
            'state' => true
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

        $response = $this->deleteJson('/api/plugin', [
            'slug' => 'Sample'
        ]);

        $response->assertStatus(406);
        $response->assertJsonFragment([
            'message' => 'Plugin is in use. You cannot uninstall it.'
        ]);
    }
}
