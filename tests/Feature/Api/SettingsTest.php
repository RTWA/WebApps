<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function testApiReadSettings()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('test_api_function', 'test_value');

        $response = $this->postJson('/api/setting', [
            'key' => 'test_api_function'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['test_api_function' => 'test_value']);
    }

    public function testApiReadMultipleSettings()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('test_api_function', 'test_value');
        ApplicationSettings::set('another_api_function', 'test_value');

        $response = $this->postJson('/api/setting', [
            'key' => json_encode(['test_api_function', 'another_api_function'])
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['test_api_function' => 'test_value', 'another_api_function' => 'test_value']);
    }

    public function testApiReadAllSettings()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('test_api_function', 'test_value');
        ApplicationSettings::set('another_api_function', 'test_value');

        $response = $this->postJson('/api/setting', [
            'key' => null
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['test_api_function' => 'test_value', 'another_api_function' => 'test_value']);
    }

    public function testApiCreateNewSetting()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->putJson('/api/setting/test_api_setting', [
            'value' => 'test_value'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['test_api_setting' => 'test_value']);
    }

    public function testApiUpdateSettingValue()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('test_api_setting', 'incorrect_value');

        $response = $this->putJson('/api/setting/test_api_setting', [
            'value' => 'test_value'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['test_api_setting' => 'test_value']);
    }

    public function testApiDeleteSettingKey()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        ApplicationSettings::set('test_api_setting', 'test_value');

        $response = $this->deleteJson('/api/setting/test_api_setting');

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }
}
