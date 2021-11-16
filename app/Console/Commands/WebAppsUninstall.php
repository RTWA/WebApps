<?php

namespace App\Console\Commands;

use App\Models\App;
use App\Models\Plugin;
use App\Services\AppsService;
use App\Services\PluginsService;
use Illuminate\Console\Command;

class WebAppsUninstall extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webapps:uninstall 
                                {--E|everything : Delete Apps and Plugins}
                                {--P|plugins : Delete Plugins}
                                {--A|apps : Delete Apps}
    {--F|force : Don\'t prompt for confirmation (combine with `--everything` to completely uninstall)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Uninstall WebApps from your system. 
    It will not delete the main WebApps package files, but will optionally delete installed Apps and Plugins.';

    private $apps = false;
    private $plugins = false;

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
        $this->warn('WARNING: This will irrecoverably delete all WebApps data.');
        $this->warn('This function is intended for developers only.');

        if ($this->option('force') || $this->confirm('Do you wish to continue?')) {
            $_apps = App::all();

            if ($this->option('apps') || $this->option('everything')
                    || $this->confirm('Do you wish to delete all installed Apps?', true)) {
                $this->apps = true;
                $apps = glob(App::path().'*');
            }

            if ($this->option('plugins') || $this->option('everything')
                    || $this->confirm('Do you wish to delete all installed Plugins?', true)) {
                $this->plugins = true;
                $plugins = glob(Plugin::path().'*');
            }

            // Task 1: Uninstall all Apps
            foreach ($_apps as $app) {
                $this->uninstallApp($app);
                $app->delete();
            }

            // Task 2 (Optional): Delete all Apps
            if ($this->apps) {
                $this->line("Deleting ".count($apps)." Apps");
                foreach ($apps as $app) {
                    (new AppsService())->rrmdir($app);
                }
            }

            // Task 3 (Optional): Delete all Plugins
            if ($this->plugins) {
                $plugins = glob(Plugin::path().'*');
                
                $this->line("Deleting ".count($plugins)." Plugins");
                foreach ($plugins as $plugin) {
                    (new PluginsService())->rrmdir($plugin);
                }
            }

            // Task 4: Migrate Reset
            $this->call('migrate:reset', ['--force' => true]);

            // Task 5: Delete installed.json
            if (is_writable(storage_path('webapps/installed.json'))) {
                unlink(storage_path('webapps/installed.json'));
                $this->line('Removed installed flag file');
            }

            // Task 6: Delete .env file
            if (is_writable(base_path('.env')) && config('app.env') <> 'testing') {
                // @codeCoverageIgnoreStart
                unlink(base_path('.env'));
                $this->newLine(2);
                $this->line('Removed .env file');
                // @codeCoverageIgnoreEnd
            } else {
                $this->newLine(2);
                $this->info('Your .env file was not deleted as it is read only.');
            }

            $this->newLine(2);
            $this->line('WebApps has been uninstalled.');
            $this->newLine();
        }
        
        return 0;
    }

    private function uninstallApp($app)
    {
        // If AppManagerController has an uninstall method, call it!
        $_app = App::createFromSlug($app->slug, 'AppManagerController');
        if (method_exists($_app, 'uninstall')) {
            $_app->uninstall();
            $this->line("Uninstalled $_app->name");
        }
    }
}
