<?php

namespace Tests\Feature;

use App\Models\App;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use App\Models\Plugin;
use App\Services\AppsService;
use App\Services\PluginsService;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RepositoryTest extends TestCase
{
    use RefreshDatabase;

    private $pluginService;
    private $appService;

    public function testInvalidPluginsRepositoryException()
    {
        $this->withoutExceptionHandling();
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Invalid Repository Found');

        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        $this->pluginService = new PluginsService();

        $this->pluginService->downloadExtract('Sample');

        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Cache::forget('repository:rawData');
        Cache::remember('repository:rawData', now()->addSeconds(10), function () {
            return [];
        });

        $response = $this->getJson('/api/plugins');
        Cache::forget('repository:rawData');

        $response->assertStatus(500);
        $response->assertJsonFragment([
            'message' => 'Invalid Repository Found'
        ]);

        if (file_exists(Plugin::path() . 'Sample/plugin.json')) {
            $this->pluginService->rrmdir(Plugin::path() . 'Sample');
        }
    }

    public function testInvalidAppsRepositoryException()
    {
        $this->withoutExceptionHandling();
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Invalid Repository Found');

        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        $this->appService = new AppsService();

        $this->appService->downloadExtract('DemoApp');

        $this->seed();

        Sanctum::actingAs(
            User::find(10),
            ['*']
        );

        Cache::forget('repository:rawData');
        Cache::remember('repository:rawData', now()->addSeconds(10), function () {
            return [];
        });

        $response = $this->getJson('/api/apps');
        Cache::forget('repository:rawData');

        $response->assertStatus(500);
        $response->assertJsonFragment([
            'message' => 'Invalid Repository Found'
        ]);

        if (file_exists(App::path() . 'DemoApp/manifest.json')) {
            $this->appService->rrmdir(App::path() . 'DemoApp');
        }
    }
}
