<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use Tests\TestCase;

class AppRoutesTest extends TestCase
{
    use RefreshDatabase;

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
}
