<?php

namespace App\Console\Commands;

use App\Models\ErrorLog;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class CleanUpErrorLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:errorLog';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleans the ErrorLog database to the last 7 days';

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
        ErrorLog::whereDate('created_at', Carbon::now()->subDays(7))->delete();
        ApplicationSettings::set('tasks.cleanUpLog.lastRun', new \DateTime());
    }
}
