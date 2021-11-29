<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

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

        return false;
    }
}
