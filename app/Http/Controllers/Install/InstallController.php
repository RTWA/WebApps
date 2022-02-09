<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Services\Install\EnvironmentInstallService;
use App\Services\Install\InstallManagerService;
use App\Services\Install\PermissionInstallService;
use App\Services\Install\RequirementsInstallService;
use Illuminate\Http\Request;
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
     * Checks if the current URL is HTTPS or not
     */
    private function isSSL()
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    }
}
