<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('cleanup:msgraph', function () {
    DB::table('msgraph_tokens')->where('expires', '<', time())->delete();
    $this->info('MS Graph API tokens cleared successfully');
});
