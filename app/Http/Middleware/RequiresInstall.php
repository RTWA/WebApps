<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequiresInstall
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

        return $next($request);
    }
}
