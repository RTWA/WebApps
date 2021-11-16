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

    public function testLoadsInstallerPage()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'PHP Version and Extensions',
            'File and Folder Permissions',
            'Setup Database'
        ]);
    }

    public function testLoadsDatabaseSetupForm()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install/database');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Database Setup',
            'Database Type',
            'Database Name',
            'Create Tables',
        ]);
    }

    public function testSaveDatabaseSetupForm()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', true);

        Livewire::test(Database::class)
            ->set('DB_CONNECTION', 'sqlite')
            ->set('DB_HOST', 'localhost')
            ->set('DB_DATABASE', ':memory:')
            ->set('DB_USERNAME', 'none')
            ->call('submitForm')
            ->assertSee('Database Setup Complete!')
            ->assertSee('Install Sample Data');
    }

    public function testSaveDatabaseSetupFormWithIncorrectDatabase()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', true);

        Livewire::test(Database::class)
            ->set('DB_CONNECTION', 'sqlite')
            ->set('DB_HOST', 'localhost')
            ->set('DB_DATABASE', '__:memory:__')
            ->set('DB_USERNAME', 'none')
            ->call('submitForm')
            ->assertHasErrors('DB_CONNECTION');
    }

    public function testCannotSaveDatabaseSetupFormWithValidationErrors()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Config::set('installer.database.allowEmptyPassword', false);

        Livewire::test(Database::class)
            ->set('DB_CONNECTION', '')
            ->set('DB_HOST', '')
            ->set('DB_DATABASE', '')
            ->set('DB_USERNAME', '')
            ->set('DB_PASSWORD', '')
            ->call('submitForm')
            ->assertHasErrors([
                'DB_CONNECTION' => 'required',
                'DB_HOST' => 'required',
                'DB_DATABASE' => 'required',
                'DB_USERNAME' => 'required',
                'DB_PASSWORD' => 'required',
            ]);
    }

    public function testCanInstallSampleData()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        Livewire::test(Database::class)
            ->set('show', 'output')
            ->call('installSampleData')
            ->assertSee('Installed Sample Data!');
    }

    public function testLoadsApplicationSetupPage()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install/application');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'WebApps URL',
            'Indigo',
            'Light Mode Only',
            'Create Administrator',
        ]);
    }

    public function testSaveApplicationSetupData()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/install/application', [
            'APP_URL' => 'http://localhost',
            'theme' => 'indigo',
            'dark_mode' => 'light',
            'error_reporting' => false
        ]);

        $response->assertRedirect('/install/administrator');
        $this->assertTrue(ApplicationSettings::get('core.ui.theme') === 'indigo');
        $this->assertTrue(ApplicationSettings::get('core.ui.dark_mode') === 'light');
    }

    public function testCannotSaveApplicationSetupDataWithValidationErrors()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/install/application', [
            'APP_URL' => '',
            'theme' => '',
            'dark_mode' => '',
            'error_reporting' => false
        ]);

        $response->assertSuccessful();
        $response->assertViewIs('install.setup');
        $response->assertSeeText('This field is required');
    }

    public function testLoadsAdministratorSetupPage()
    {
        Artisan::call('migrate');
        Artisan::call('db:seed', ['--class' => 'RolePermissionsSeeder']);
        Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install/administrator');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Username',
            'Password',
            'Confirm Password',
            'Complete Installation',
        ]);
    }

    public function testLoadsAdministratorSetupPageWhenAdministratorAlreadyExists()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install/administrator');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Create Administrator Account',
            'WebApps must always have at least one internal administrator account!',
            'An account already exists in the group Administrators, you can skip this step.',
            'Complete Installation',
        ]);
    }

    public function testCreateAdministratorAccount()
    {
        Artisan::call('migrate');
        Artisan::call('db:seed', ['--class' => 'RolePermissionsSeeder']);
        Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/install/administrator', [
            'username' => 'administrator',
            'password' => 'password',
            'password_confirmation' => 'password'
        ]);

        $response->assertRedirect('/install/complete');
        $this->assertNotNull(User::where('username', 'administrator')->first());
    }

    public function testCannotCreateAdministratorAccountWithValidationErrors()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->post('/install/administrator', [
            'username' => '',
            'password' => 'password',
            'password_confirmation' => 'password123'
        ]);

        $response->assertSuccessful();
        $response->assertViewIs('install.admin');
        $response->assertSeeText('This field is required');
    }

    public function testLoadsSetupCompletePage()
    {
        $this->seed();

        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/install/complete');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'WebApps is installed!',
            'Installation Completed!',
            'Go to WebApps',
        ]);
    }
}
