<?php

namespace App\Console\Commands;

use App\Services\Install\EnvironmentInstallService;
use App\Services\Install\InstallManagerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class WebAppsInstall extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webapps:install
                            {--E|existing : Use exisiting .env file settings}
                            {--D|developer : Enable developer mode}
    {--S|sample : Install sample data (Recommended - this will include an Administrator account!)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install WebApps quickly without needing to traverse through the installation wizard.';

    private $envExists = false;
    private $envWriteable = true;

    private $useEnv;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->useEnv = $this->option('existing');

        if (file_exists(base_path('.env'))) {
            $this->envExists = true;
            $this->info('A .env file already exists.');

            // @codeCoverageIgnoreStart
            if (!is_writable(base_path('.env'))) {
                $this->envWriteable = false;
                $this->warn('Your .env file is read only - using current settings.');
            }
            // @codeCoverageIgnoreEnd
        }

        if (config('app.env') <> 'testing') {
            // @codeCoverageIgnoreStart
            if (!$this->envExists) {
                copy(base_path('.env.example'), base_path('.env'));
                $this->call('key:generate');
                $this->line('.env File Created');
            }
            // @codeCoverageIgnoreEnd
        }

        if ($this->envWriteable) {
            $service = new EnvironmentInstallService();
            $service->set('APP_URL', $this->askURL());
            $service->set('DB_CONNECTION', $this->askDBConnection());
            $service->set('DB_HOST', $this->askDBHost());
            $service->set('DB_PORT', $this->askDBPort());
            $service->set('DB_DATABASE', $this->askDBName());
            $service->set('DB_USERNAME', $this->askDBUsername());
            $service->set('DB_PASSWORD', $this->askDBPassword());
            $service->set(
                'SANCTUM_STATEFUL_DOMAINS',
                preg_replace('/(https|http):\/\//', '', $service->get('APP_URL'), 1)
            );

            if ($this->option('developer') || $this->confirm('Enter development environment?', true)) {
                $service->set('APP_ENV', 'local');
                $service->set('APP_DEBUG', "true");

                $this->newLine();
                $this->info('WebApps has been configured for development.');
            }
        }

        if (config('app.env') <> 'testing') {
            // @codeCoverageIgnoreStart
            $this->overwriteConfig($service);
            $this->call('migrate:fresh', ["--force" => true, "--database" => $service->get('DB_CONNECTION')]);
            $this->call('db:seed', ["--force" => true, "--database" => $service->get('DB_CONNECTION')]);

            if ($this->option('sample')) {
                $this->call('webapps:sample-data');
            }

            // Setup UI Theme and Dark Mode Options
            if (!DB::table('settings')->where('key', 'core.ui.theme')->first()) {
                DB::table('settings')->insert([
                    'key' => 'core.ui.theme',
                    'value' => $this->getRandomTheme(),
                ]);
            }
            if (!DB::table('settings')->where('key', 'core.ui.dark_mode')->first()) {
                DB::table('settings')->insert([
                    'key' => 'core.ui.dark_mode',
                    'value' => 'user',
                ]);
            }

            (new InstallManagerService())->completeInstall(false);
            // @codeCoverageIgnoreEnd
        }

        $this->newLine(2);
        $this->line('WebApps has been installed.');
        $this->newLine();

        return 0;
    }

    /**
     * @codeCoverageIgnore
     */
    private function askURL()
    {
        return ($this->useEnv)
            ? env('APP_URL')
            : $this->ask(
                'Please enter your WebApps URL (including https:// prefix)',
                rtrim(env('APP_URL'), '/')
            );
    }

    private function askDBConnection()
    {
        $choices = [
            'mysql' => 'MySQL / MariaDB',
            'sqlsrv' => 'Microsoft SQL Server',
            'sqlite' => 'SQLite',
            'pgsql' => 'PostgreSQL'
        ];

        // @codeCoverageIgnoreStart
        return ($this->useEnv)
            ? env('DB_CONNECTION')
            : $this->choice(
                'Please select your database connection type',
                $choices,
                $choices[(env('DB_CONNECTION')) ?: 'mysql']
            );
        // @codeCoverageIgnoreEnd
    }

    /**
     * @codeCoverageIgnore
     */
    private function askDBHost()
    {
        return ($this->useEnv)
            ? env('DB_HOST')
            : $this->ask('Please enter your database server hostname', env('DB_HOST', 'localhost'));
    }

    /**
     * @codeCoverageIgnore
     */
    private function askDBPort()
    {
        return ($this->useEnv)
            ? env('DB_PORT')
            : $this->ask('Please enter your database server port', env('DB_PORT', 3306));
    }

    /**
     * @codeCoverageIgnore
     */
    private function askDBName()
    {
        return ($this->useEnv)
            ? env('DB_DATABASE')
            : $this->ask('Please enter your database name', env('DB_DATABASE', 'webapps'));
    }

    /**
     * @codeCoverageIgnore
     */
    private function askDBUsername()
    {
        return ($this->useEnv)
            ? env('DB_USERNAME')
            : $this->ask('Please enter your database username', env('DB_USERNAME', 'root'));
    }

    /**
     * @codeCoverageIgnore
     */
    private function askDBPassword()
    {
        return ($this->useEnv)
            ? env('DB_PASSWORD')
            : $this->ask('Please enter your database password', env('DB_PASSWORD'));
    }

    /**
     * @codeCoverageIgnore
     */
    private function overwriteConfig(EnvironmentInstallService $service)
    {
        $this->callSilently('config:clear');

        $newConn = config('database.connections.' . $service->get('DB_CONNECTION'));
        $newConn['host'] = $service->get('DB_HOST');
        $newConn['port'] = $service->get('DB_PORT');
        $newConn['database'] = $service->get('DB_DATABASE');
        $newConn['username'] = $service->get('DB_USERNAME');
        $newConn['password'] = $service->get('DB_PASSWORD');

        Config::set([
            'database.connections.' . $service->get('DB_CONNECTION') => $newConn,
            'database.default' => $service->get('DB_CONNECTION')
        ]);
        DB::reconnect(Config::get('database.default'));
    }

    /**
     * @codeCoverageIgnore
     */
    public function getRandomTheme()
    {
        $themes = ['indigo', 'fuchsia', 'light-blue', 'red', 'orange', 'yellow', 'lime', 'gray'];

        return $themes[rand(0, count($themes) - 1)];
    }
}
