<?php

namespace Tests\Feature;

use App\Http\Livewire\Install\Database;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Livewire\Livewire;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Tests\TestCase;

class InstallerTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        if (!Schema::hasTable('sessions')) {
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2021_07_23_082147_create_sessions_table.php',
                '--force' => true
            ]);
        }
    }

    public function tearDown(): void
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        parent::tearDown();
    }

    public function testRedirectsToInstallerIfWebappsIsNotInstalled()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/');

        $response->assertRedirect('/install');
    }

    public function testRedirectsToRootIfWebappsIsAlreadyInstalled()
    {
        if (!file_exists(storage_path('webapps/installed.json'))) {
            file_put_contents(
                storage_path('webapps/installed.json'),
                json_encode([
                    'version' => 'testing',
                ])
            );
        }

        $response = $this->get('/install');

        $response->assertRedirect('/');
    }

    public function testCheckRequirementsApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/requirements');

        $response->assertSuccessful();
    }

    public function testLoadsDatabaseSetupFormDataApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/database');

        $response->assertSuccessful();
    }

    public function testSaveDatabaseSetupFormApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', true);

        $response = $this->post('/api/install/database', [
            'DB_CONNECTION' => 'sqlite',
            'DB_HOST' => 'localhost',
            'DB_DATABASE' => ':memory:',
            'DB_USERNAME' => 'none',
            'DB_PASSWORD' => null,
            'DB_PORT' => null
        ]);

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'title',
            'body'
        ]);
    }

    public function testSaveDatabaseSetupFormWithIncorrectDatabaseApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', true);

        $response = $this->post('/api/install/database', [
            'DB_CONNECTION' => 'sqlite',
            'DB_HOST' => 'localhost',
            'DB_DATABASE' => '__:memory:__',
            'DB_USERNAME' => 'none',
            'DB_PASSWORD' => null,
            'DB_PORT' => null
        ]);

        $response->assertStatus(302);
    }

    public function testCannotSaveDatabaseSetupFormWithValidationErrorsApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', false);

        $response = $this->post('/api/install/database', [
            'DB_CONNECTION' => '',
            'DB_HOST' => '',
            'DB_DATABASE' => '',
            'DB_USERNAME' => '',
            'DB_PASSWORD' => '',
            'DB_PORT' => ''
        ]);

        $response->assertStatus(302);
    }

    public function testCanMigrateAndSeedApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/install/database/migrate');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'title' => "Database Setup Complete!"
        ]);
    }

    public function testCanInstallSampleDataApi()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/install/database/sample');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'title' => "Installed Sample Data!"
        ]);
    }

    public function testGetApplicationSetupDataApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/application');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'APP_URL',
            'theme',
            'dark_mode',
            'error_reporting'
        ]);
    }

    public function testSaveApplicationSetupDataApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/install/application', [
            'APP_URL' => 'http://localhost',
            'theme' => 'red',
            'dark_mode' => 'user',
            'error_reporting' => false
        ]);

        $response->assertSuccessful();
        $this->assertTrue(ApplicationSettings::get('core.ui.theme') === 'red');
        $this->assertTrue(ApplicationSettings::get('core.ui.dark_mode') === 'user');
    }

    public function testLoadsAdministratorSetupDataApi()
    {
        Artisan::call('migrate');
        Artisan::call('db:seed', ['--class' => 'RolePermissionsSeeder']);
        Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/administrator');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'username',
            'password'
        ]);
    }

    public function testLoadsAdministratorSetupDataWhenAdministratorAlreadyExistsApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/administrator');

        $response->assertSuccessful();
        $response->assertJson([
            'exists' => true,
        ]);
    }

    public function testCreateAdministratorAccountApi()
    {
        Artisan::call('migrate');
        Artisan::call('db:seed', ['--class' => 'RolePermissionsSeeder']);
        Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/install/administrator', [
            'username' => 'administrator',
            'password' => 'password',
            'password_confirmation' => 'password'
        ]);

        $response->assertStatus(204);
    }

    public function testLoadsSetupCompleteApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/install/complete');

        $response->assertSuccessful();
    }

    public function testLoadsThemeDataApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/api/theme');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'core.ui.theme',
            'core.ui.dark_mode'
        ]);
    }

    public function testSetThemeColorApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/color', [
            'theme' => 'gray'
        ]);

        $response->assertSuccessful();
        $this->assertTrue(ApplicationSettings::get('core.ui.theme') === 'gray');
    }

    public function testSetDarkModeApi()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/api/dark', [
            'mode' => 'user'
        ]);

        $response->assertSuccessful();
        $this->assertTrue(ApplicationSettings::get('core.ui.dark_mode') === 'user');
    }
}
