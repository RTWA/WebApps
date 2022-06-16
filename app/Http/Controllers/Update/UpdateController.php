<?php

namespace App\Http\Controllers\Update;

use App\Http\Controllers\Controller;
use App\Services\Install\InstallManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Symfony\Component\Console\Output\BufferedOutput;

class UpdateController extends Controller
{
    public function start()
    {
        return view('update.start');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return back()
                ->withInput([
                    'username' => $request->input('username'),
                    'backup_confirm' => $request->input('backup_confirm')
                ])
                ->withErrors([
                    'username' => 'The provided credentials do not match our records.',
                ]);
        }

        if ($request->input('backup_confirm') !== 'on') {
            return back()
                ->withInput([
                    'username' => $request->input('username'),
                    'backup_confirm' => $request->input('backup_confirm')
                ])
                ->withErrors([
                    'backup_confirm' => 'Please confirm you have taken a backup of your database!'
                ]);
        }

        return redirect(route('Update::database'));
    }

    public function database()
    {
        $migrations = $this->getMigrations();
        $updates = $migrations['updates'];

        return view('update.database', compact('updates'));
    }

    public function databaseUpdate()
    {
        $migrations = $this->getMigrations();

        if ($migrations['updates'] === 0) {
            return redirect(route('Update::complete'));
        }

        $outputLog = new BufferedOutput;
        Artisan::call('migrate', ["--force" => true], $outputLog);
        $outputString = $outputLog->fetch();

        return view('update.database_complete', compact('outputString'));
    }

    public function complete()
    {
        // Install any new required settings
        (new InstallManagerService())->createSettings();

        // Get current version
        $current = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);

        // Get installed version
        $installed = json_decode(file_get_contents(storage_path('webapps/installed.json')), true);

        if ($installed['version'] <> $current['app_version']) {
            $installed['history'][] = [
                'version' => $installed['version'],
                'installed' => isset($installed['installed']) ? $installed['installed'] : 'Unknown',
            ];
            $installed['version'] = $current['app_version'];
            $installed['installed'] = date('Y-m-d h:i:sa');

            file_put_contents(
                storage_path('webapps/installed.json'),
                json_encode($installed)
            );
        }

        Cache::forget('product.info');

        // Update any Caches
        if (App::environment() !== 'testing') {
            // @codeCoverageIgnoreStart
            Artisan::call('view:cache', []);
            Artisan::call('storage:link', []);
            // @codeCoverageIgnoreEnd
        }

        return view('update.finished');
    }

    /**
     * Get the state of the current route
     *
     * @param string|array $route
     * @param array $next
     * @return string
     */
    public static function getState($route, $next)
    {
        $isActive = false;
        $isSuccess = in_array(Route::currentRouteName(), $next) ? true : false;

        if (is_array($route)) {
            $isActive = in_array(Route::currentRoutename(), $route) ? true : false;
        }
        if (Route::currentRouteName() == $route) {
            $isActive = true;
        }
        // @codeCoverageIgnoreStart
        if (!is_array($route)) {
            if (strpos(URL::current(), $route)) {
                $isActive = true;
            }
        }
        // @codeCoverageIgnoreEnd

        if ($isActive) {
            return 'active';
        } elseif ($isSuccess) {
            return 'success';
        }

        return null;
    }

    public static function getRouteTab($step, $route, $next)
    {
        $color = (self::getState($route, $next) === 'active'
            || self::getState($route, $next) === 'success') ? 'indigo-600' : 'gray-400';

        $darkColor = (self::getState($route, $next) === 'active'
            || self::getState($route, $next) === 'success') ? 'indigo-400' : 'gray-400';

        $iconSuccess = (self::getState($route, $next) === 'success') ? 'white bg-indigo-600'
            : ((self::getState($route, $next) === 'active') ? 'indigo-600' : 'gray-400');

        $darkIconSuccess = (self::getState($route, $next) === 'success') ? 'white dark:bg-indigo-400'
            : ((self::getState($route, $next) === 'active') ? 'indigo-400' : 'gray-400');

        $icon = (self::getState($route, $next) !== 'success')
            ? $step['icon']
            : '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" width="24" height="24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>';

        return '<div class="flex flex-row mx-4 py-4 border-t-4 border-' . $color . ' dark:border-' . $darkColor . '">
                    <div class="relative px-4">
                        <div class="w-10 h-10 mx-auto rounded-full text-lg flex items-center 
                                border-2 border-' . $color . ' dark:border-' . $darkColor . '
                                text-' . $iconSuccess . ' dark:text-' . $darkIconSuccess . '">
                            <span class="text-center w-full">' . $icon . '</span>
                        </div>
                    </div>
                    <div class="flex flex-col font-medium -mt-1">
                        <p class="text-' . $color . ' dark:text-' . $darkColor . ' uppercase">
                            Step ' . $step['step'] . '
                        </p>
                        <p>' . $step['title'] . '</p>
                    </div>
                </div>';
    }

    private function getMigrations()
    {
        $migrations = glob(database_path() . DIRECTORY_SEPARATOR . 'migrations' . DIRECTORY_SEPARATOR . '*.php');
        $executed = DB::table('migrations')->get()->pluck('migration');

        return [
            'migrations' => $migrations,
            'executed' => $executed,
            'updates' => count($migrations) - count($executed)
        ];
    }
}
