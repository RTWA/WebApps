<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CanUpdate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!file_exists(storage_path('webapps/installed.json'))) {
            return redirect()->route('Install::start');
        }

        if (!$this->updateAvailable()) {
            return redirect('/');
        }

        return $next($request);
    }

    /**
     * Test if there is an update available to install
     *
     * @return bool
     */
    public function updateAvailable()
    {
        // Get current version
        $current = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);

        // Get installed version
        $installed = json_decode(file_get_contents(storage_path('webapps/installed.json')), true);

        if (version_compare($installed['version'], $current['app_version'], '<')) {
            return true;
        }

        $migrations = $this->getMigrations();
        $executed = $this->getExecutedMigrations();
        
        if (count($migrations) == count($executed)) {
            return false;
        }

        return true;
    }

    /**
     * Get the available migrations from the filesystem
     */
    private function getMigrations()
    {
        $migrations = glob(database_path().DIRECTORY_SEPARATOR.'migrations'.DIRECTORY_SEPARATOR.'*.php');
        return str_replace('.php', '', $migrations);
    }

     /**
      * Get a list of executed migrations
      */
    private function getExecutedMigrations()
    {
        return DB::table('migrations')->get()->pluck('migration');
    }
}
