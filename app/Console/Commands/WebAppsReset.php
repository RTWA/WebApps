<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class WebAppsReset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webapps:reset {--S|sample : Install with sample data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Completely reset WebApps Developer environment';

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
        // Check WebApps is installed first
        if (file_exists(storage_path('webapps/installed.json'))) {
            $this->call('webapps:uninstall', ['--everything' => true, '--force' => true]);
        }
        $this->call(
            'webapps:install',
            ['--existing' => true, '--developer' => true, '--sample' => $this->option('sample')]
        );
        return 0;
    }
}
