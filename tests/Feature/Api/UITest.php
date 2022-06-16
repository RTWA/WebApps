<?php

namespace Tests\Feature\Api;

use App\Models\App;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Services\AppsService;
use Laravel\Sanctum\Sanctum;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class UITest extends TestCase
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

    public function testApiNavigationResponse()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        // Download and install DemoApp for navigation
        $response = $this->postJson('/api/online/apps/download', [
            'slug' => 'DemoApp'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'apps'
        ]);

        $app = App::findBySlug('DemoApp')->first();
        $app->active = true;
        $app->save();

        ApplicationSettings::set('core.cms.display_link', "true");
        ApplicationSettings::set('core.cms.text', 'Return to CMS');
        ApplicationSettings::set('core.cms.url', '#');
        ApplicationSettings::set('core.ui.theme', 'indigo');
        ApplicationSettings::set('core.ui.dark_mode', 'user');
        ApplicationSettings::set('core.available.updates', json_encode([
            'WebApps' => ['version' => '1.0.0'],
            'apps' => ['DemoApp' => ['version' => '1.0.0']],
            'plugins' => ['Sample' => ['version' => '1.0.0']],
        ]));

        $response = $this->getJson('/api/navigation');

        $response->assertSuccessful();
        $response->assertJsonFragment(['name' => 'Apps']);
        $response->assertJsonFragment(['name' => 'Return to CMS']);
        $response->assertJsonFragment(['name' => $user->name]);
        $response->assertJsonFragment(['name' => "WebApps Settings", 'to' => "/settings"]);
    }

    public function testApiNavigationResponseWithDarkSidebar()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('core.sidebar.color_mode', 'dark');
        
        $response = $this->getJson('/api/navigation');
        $response->assertSuccessful();
    }
}
