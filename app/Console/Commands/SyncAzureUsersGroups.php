<?php

namespace App\Console\Commands;

use App\Http\Controllers\msGraphController;
use Illuminate\Console\Command;

class SyncAzureUsersGroups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'azure:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronises mapped Azure Groups and their members';

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
        (new msGraphController())->syncUsersAndGroups();
        $this->info('Azure Users & Groups synchronised successfully');
        return 0;
    }
}
