<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequiresUpdate
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
        // Get current version
        $current = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);

        // Get installed version
        $installed = json_decode(file_get_contents(storage_path('webapps/installed.json')), true);

        if (version_compare($installed['version'], $current['app_version'], '<')) {
            return redirect()->route('Update::start');
        }

        return $next($request);
    }
}
