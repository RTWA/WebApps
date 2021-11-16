<?php

namespace Tests\Feature;

use App\Models\App;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Services\AppsService;

class AppsTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        (new AppsService())->downloadExtract('DemoApp');
    }

    public function tearDown(): void
    {
        if (file_exists(App::path() . 'DemoApp/manifest.json')) {
            (new AppsService())->rrmdir(App::path() . 'DemoApp');
        }

        parent::tearDown();
    }

    public function testCanGetListOfAllApps()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/apps');

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCanGetAListOfOnlineApps()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/online/apps/list');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'apps'
        ]);
    }

    public function testCannotGetAListOfOnlineAppsWithoutAdminAccessPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->getJson('/api/online/apps/list');

        $response->assertStatus(403);
        $response->assertJsonFragment([
            'message' => 'You do not have permission to install Apps'
        ]);
    }

    public function testCanDownloadAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/online/apps/download', [
            'slug' => 'DemoApp'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'apps'
        ]);
    }

    public function testCannotDownloadAnAppThatDoesNotExist()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/online/apps/download', [
            'slug' => 'ThisAppDoesNotExist'
        ]);

        $response->assertStatus(404);
    }

    public function testCanDownloadAnUpdateForAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        App::create([
            'slug' => 'DemoApp',
            'name' => 'PHPUnit Test App',
            'icon' => '',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'menu' => json_encode([]),
            'routes' => json_encode([]),
            'active' => 0
        ]);

        $response = $this->postJson('/api/online/apps/download', [
            'slug' => 'DemoApp'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'apps'
        ]);
        $response->assertJsonMissing([
            'version' => 'PHPUnitLatestVersion'
        ]);
    }

    public function testCanActivateAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        App::create([
            'slug' => 'DemoApp',
            'name' => 'PHPUnit Test App',
            'icon' => '',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'menu' => json_encode([]),
            'routes' => json_encode([]),
            'active' => 0
        ]);

        $response = $this->postJson('/api/apps/control', [
            'slug' => 'DemoApp',
            'task' => 'activate'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'PHPUnit Test App Activated'
        ]);
    }

    public function testCanDeactivateAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        App::create([
            'slug' => 'DemoApp',
            'name' => 'PHPUnit Test App',
            'icon' => '',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'menu' => json_encode([]),
            'routes' => json_encode([]),
            'active' => 1
        ]);

        $response = $this->postJson('/api/apps/control', [
            'slug' => 'DemoApp',
            'task' => 'deactivate'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'PHPUnit Test App Deactivated'
        ]);
    }

    public function testCanInstallAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/apps/control', [
            'slug' => 'DemoApp',
            'task' => 'install'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'Demo App Installed'
        ]);
    }

    public function testCanUninstallAnApp()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        App::create([
            'slug' => 'DemoApp',
            'name' => 'PHPUnit Test App',
            'icon' => '',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'menu' => json_encode([]),
            'routes' => json_encode([]),
            'active' => 0
        ]);

        $response = $this->postJson('/api/apps/control', [
            'slug' => 'DemoApp',
            'task' => 'uninstall'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'PHPUnit Test App Uninstalled'
        ]);
    }

    public function testCannotPerformAnUnknownAppControlTask()
    {
        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        App::create([
            'slug' => 'DemoApp',
            'name' => 'PHPUnit Test App',
            'icon' => '',
            'version' => 'PHPUnitLatestVersion',
            'author' => 'PHPUnit',
            'menu' => json_encode([]),
            'routes' => json_encode([]),
            'active' => 0
        ]);

        $response = $this->postJson('/api/apps/control', [
            'slug' => 'DemoApp',
            'task' => 'unknown'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => false,
            'message' => 'Unknown Task'
        ]);
    }
}
