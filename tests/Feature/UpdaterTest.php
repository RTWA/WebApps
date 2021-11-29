<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdaterTest extends TestCase
{
    use RefreshDatabase;

    public $webapps;
    public $files = [];

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

        $current = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);
        $this->webapps = $current;

        if ($current['app_version'] <> '9.9.9') {
            file_put_contents(
                storage_path('webapps/core/webapps.json'),
                json_encode([
                    'app_name' => 'WebApps',
                    'app_version' => '9.9.9'
                ])
            );
        }
    }

    public function tearDown(): void
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        foreach ($this->files as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }

        file_put_contents(
            storage_path('webapps/core/webapps.json'),
            json_encode($this->webapps)
        );

        parent::tearDown();
    }

    public function testRedirectsToInstallerIfWebappsIsNotInstalled()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $response = $this->get('/update');

        $response->assertRedirect('/install');
    }

    public function testRedirectsToRootIfWebappsIsAlreadyInstalledAndUpdated()
    {
        file_put_contents(
            storage_path('webapps/installed.json'),
            json_encode([
                'version' => '9.9.9',
            ])
        );

        $response = $this->get('/update');

        $response->assertRedirect('/');
    }

    public function testRedirectsToUpdaterIfWebappsNeedsUpdate()
    {
        $response = $this->get('/');

        $response->assertRedirect('/update');
    }

    public function testLoadsUpdaterPage()
    {
        $response = $this->get('/update');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Update WebApps',
            'To begin, please login with a WebApps Administrator account.',
            'Login'
        ]);
    }

    public function testUserCannotLoginWithIncorrectCredentials()
    {
        $this->seed();

        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);

        $user->assignRole('Administrators');

        $response = $this->from('/update')->post('/update/login', [
            'username' => $user->username,
            'password' => 'incorrect-password'
        ]);

        $response->assertRedirect('/update');
        $response->assertSessionHasErrors('username');
        $this->assertTrue(session()->hasOldInput('username'));
        $this->assertFalse(session()->hasOldInput('password'));
        $this->assertGuest();
    }

    public function testUserCannotLoginWithCorrectCredentialsButNotConfirmedBackup()
    {
        $this->seed();

        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);

        $user->assignRole('Administrators');

        $response = $this->from('/update')->post('/update/login', [
            'username' => $user->username,
            'password' => 'webapps_test-user'
        ]);

        $response->assertRedirect('/update');
        $response->assertSessionHasErrors('backup_confirm');
        $this->assertTrue(session()->hasOldInput('username'));
        $this->assertFalse(session()->hasOldInput('password'));
    }

    public function testUserCanLoginWithCorrectCredentialsAndConfirmedBackup()
    {
        $this->seed();

        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);

        $user->assignRole('Administrators');

        $response = $this->from('/update')->post('/update/login', [
            'username' => $user->username,
            'password' => 'webapps_test-user',
            'backup_confirm' => 'on',
        ]);

        $response->assertRedirect('/update/database');
    }

    public function testUserCanSeeWhenThereAreNoMigrationsRequired()
    {
        $response = $this->get('update/database');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Database Update',
            'There are 0 database updates required for this WebApps update to complete.',
            'Next'
        ]);
    }

    public function testUserCanSeeWhenThereAreMigrationsRequired()
    {
        Artisan::call('make:migration', ['name' => 'testMigration']);
        $this->files[] = glob(
            database_path() . DIRECTORY_SEPARATOR . 'migrations' . DIRECTORY_SEPARATOR . '*test_migration.php'
        )[0];

        $response = $this->get('update/database');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Database Update',
            'There are 1 database updates required for this WebApps update to complete.',
            'Next'
        ]);
    }

    public function testUserCannotPerformTheRequiredMigrationsWhenThereAreNoMigrations()
    {
        $response = $this->get('update/database/update');

        $response->assertRedirect('/update/complete');
    }

    public function testUserCanPerformTheRequiredMigrations()
    {
        Artisan::call('make:migration', ['name' => 'testMigrationAction']);
        $this->files[] = glob(
            database_path() . DIRECTORY_SEPARATOR . 'migrations' . DIRECTORY_SEPARATOR . '*test_migration_action.php'
            )[0];

        $response = $this->get('update/database/update');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Database Update',
            'Database Updated!',
            'Next'
        ]);
    }

    public function testUpdateIsComplete()
    {
        $response = $this->get('update/complete');

        $response->assertSuccessful();
        $response->assertSeeTextInOrder([
            'Updated WebApps',
            'Update Completed!',
            'Return to WebApps'
        ]);
    }
}
