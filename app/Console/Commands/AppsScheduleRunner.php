<?php

namespace App\Console\Commands;

use App\Models\AppsScheduler;
use DateTime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class AppsScheduleRunner extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apps:schedule';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Triggers WebApps App Schedules';

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
        $commands = AppsScheduler::all();
        $ran = 0;

        foreach ($commands as $command) {
            $next_run = strtotime($command->schedule, strtotime($command->last_run));

            if (new DateTime() > new DateTime(date('Y-m-d H:i:s', $next_run))) {
                // Due to run
                Artisan::call($command->command);
                $command->last_run = date('Y-m-d H:i:s');
                $command->save();

                $ran++;
            }
            // Not due to run, skip.
        }
        $this->info($ran." commands were run.");
        return 0;
    }
}
