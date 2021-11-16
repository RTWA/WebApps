<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class WebAppsSampleData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webapps:sample-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install WebApps Sample Data';

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
        // Check we are installed and have a .env file
        if (file_exists(base_path('.env')) && file_exists(storage_path('webapps/installed.json'))) {
            $this->call('db:seed', ["--class" => 'UserSeeder', "--force" => true]);
            $this->call('db:seed', ["--class" => 'BlockSeeder', "--force" => true]);
        }

        return 0;
    }
}
