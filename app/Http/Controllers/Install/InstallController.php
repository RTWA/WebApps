<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Services\Install\EnvironmentInstallService;
use App\Services\Install\InstallManagerService;
use App\Services\Install\PermissionInstallService;
use App\Services\Install\RequirementsInstallService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class InstallController extends Controller
{
    /**
     * Get the requirements status
     */
    public function start()
    {
        // Setup the App Key
        (new InstallManagerService())->generateKey();

        $requirementService = new RequirementsInstallService();
        $phpSupportInfo = $requirementService->checkPHPVersion(
            config('installer.core.minPhpVersion')
        );
        $requirements = $requirementService->check(
            config('installer.requirements')
        );

        $permissionService = new PermissionInstallService();
        $permissions = $permissionService->check(
            config('installer.permissions')
        );

        return response()->json([
            'requirements' => $requirements,
            'phpSupportInfo' => $phpSupportInfo,
            'permissions' => $permissions
        ], 200);
    }

    /**
     * Display the WebApps Setup page
     */
    public function setup()
    {
        return response()->json([
            'APP_URL' => (($this->isSSL()) ? 'https://' : 'http://')
                . (!app()->environment('testing') ? $_SERVER['HTTP_HOST'] : ''),
            'theme' => 'indigo',
            'dark_mode' => 'light',
            'error_reporting' => true,
        ], 200);
    }

    /**
     * Save the supplied WebApps Settings
     */
    public function setupSave(Request $request)
    {
        $rules = [
            'APP_URL' => 'required',
            'theme' => 'required',
            'dark_mode' => 'required',
            'error_reporting' => 'boolean',
        ];
        $messages = [
            'required' => 'This field is required'
        ];

        $validatedData = $request->validate($rules, $messages);

        $service = new EnvironmentInstallService();
        $service->set('APP_URL', $validatedData['APP_URL']);
        $service->set(
            'SANCTUM_STATEFUL_DOMAINS',
            preg_replace('/(https|http):\/\//', '', $validatedData['APP_URL'], 1)
        );

        ApplicationSettings::set('core.ui.theme', $validatedData['theme']);
        ApplicationSettings::set('core.ui.dark_mode', $validatedData['dark_mode']);
        ApplicationSettings::set('core.error.reporting', ($validatedData['error_reporting']) ? "true" : "false");

        return response(null, 201);
    }

    /**
     * Display the setup complete page
     */
    public function complete()
    {
        $manager = new InstallManagerService();
        $messages = $manager->completeInstall();

        return response()->json([
            'message' => $messages
        ]);
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

    private function isSSL()
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    }
}
