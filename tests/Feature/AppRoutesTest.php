<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use Tests\TestCase;

class AppRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function testCanGetErrorLog()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/error-log');

        $response->assertSuccessful();
    }

    public function testCanGetProductInfo()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/product');

        $response->assertSuccessful();
    }

    public function testCanGetUpdateInfo()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/update-info');

        $response->assertSuccessful();
    }

    public function testCanCheckForUpdates()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/update-check');

        $response->assertSuccessful();
    }

    public function testCanClearCache()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/clear-cache');

        $response->assertSuccessful();
    }

    public function testCanGetSystemTasks()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/system-tasks');

        $response->assertSuccessful();
    }

    public function testCanRunATask()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/run-task', [
            'command' => 'route:clear'
        ]);

        $response->assertSuccessful();
    }
}
