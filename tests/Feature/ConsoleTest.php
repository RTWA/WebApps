<?php

namespace Tests\Feature;

use App\Models\App;
use App\Models\AppsScheduler;
use App\Services\AppsService;
use App\Services\Install\InstallManagerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ConsoleTest extends TestCase
{
    use RefreshDatabase;

    public function testCanRunAppsScheduleTask()
    {
        $this->seed();

        AppsScheduler::create([
            'app' => 0,
            'command' => 'route:clear',
            'last_run' => now()->subDays(2),
            'schedule' => '+1 day'
        ]);

        $this->artisan('apps:schedule')
            ->assertExitCode(0);
    }

    public function testCanRunWebappsInstallTask()
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        $this->artisan('webapps:install')
            ->expectsOutput('A .env file already exists.')
            ->expectsQuestion('Please enter your WebApps URL (including https:// prefix)', 'http://localhost')
            ->expectsChoice(
                'Please select your database connection type',
                'mysql',
                [
                    'mysql' => 'MySQL / MariaDB',
                    'sqlsrv' => 'Microsoft SQL Server',
                    'sqlite' => 'SQLite',
                    'pgsql' => 'PostgreSQL',
                    // Not sure why this is required
                    'mysql',
                    'sqlsrv',
                    'sqlite',
                    'pgsql'
                ]
            )
            ->expectsQuestion('Please enter your database server hostname', 'localhost')
            ->expectsQuestion('Please enter your database server port', '')
            ->expectsQuestion('Please enter your database name', 'webapps')
            ->expectsQuestion('Please enter your database username', 'root')
            ->expectsQuestion('Please enter your database password', '')
            ->expectsConfirmation('Enter development environment?', 'yes')
            ->assertExitCode(0);
    }

    public function testCanInstallSampleData()
    {
        Artisan::call('migrate:fresh', ['--force' => true]);
        (new InstallManagerService())->completeInstall(false);

        $this->artisan('webapps:sample-data')
            ->assertExitCode(0);
    }

    public function testCanRunWebappsUninstallTask()
    {
        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        (new AppsService())->downloadExtract('DemoApp');

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

        $this->artisan('webapps:uninstall')
            ->expectsQuestion('Do you wish to continue?', 'yes')
            ->expectsQuestion('Do you wish to delete all installed Apps?', 'yes')
            ->expectsQuestion('Do you wish to delete all installed Plugins?', 'yes')
            ->expectsOutput('WebApps has been uninstalled.')
            ->assertExitCode(0);

        if (file_exists(App::path() . 'DemoApp/manifest.json')) {
            (new AppsService())->rrmdir(App::path() . 'DemoApp');
        }
    }

    public function testCanRunWebappsResetTask()
    {
        Artisan::call('migrate:fresh', ['--force' => true]);
        (new InstallManagerService())->completeInstall(false);

        $this->app->instance('path.config', app()->basePath() . DIRECTORY_SEPARATOR . 'config');
        $this->app->instance('path.storage', app()->basePath() . DIRECTORY_SEPARATOR . 'storage');

        (new AppsService())->downloadExtract('DemoApp');

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

        $this->artisan('webapps:reset')
            ->assertExitCode(0);

        if (file_exists(App::path() . 'DemoApp/manifest.json')) {
            (new AppsService())->rrmdir(App::path() . 'DemoApp');
        }
    }
}
