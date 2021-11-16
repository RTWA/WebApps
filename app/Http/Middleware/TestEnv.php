<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class TestEnv
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
        if (!file_exists(base_path('.env'))) {
            copy(base_path('.env.example'), base_path('.env'));
            Artisan::call('key:generate');
        }

        return $next($request);
    }
}
