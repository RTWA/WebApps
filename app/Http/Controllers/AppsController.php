<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Services\AppsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppsController extends Controller
{
    /**
     * Return all apps
     */
    public function all()
    {
        return response()->json([
            'success' => true,
            'apps' => (new AppsService())->getLocal()
        ], 200);
    }

    /**
     * Returns a list of Apps available online
     */
    public function online()
    {
        if (!Auth::user()->hasPermissionTo('admin.access')) {
            abort(403, 'You do not have permission to install Apps');
        }
        return response()->json([
            'success' => true,
            'apps' => (new AppsService())->getOnline()
        ]);
    }

    /**
     * Download, Extract and Install an App from Online Repository
     */
    public function download(Request $request)
    {
        (new AppsService())->downloadExtract($request->input('slug'));
        // Create AppManagerController object
        $_app = App::createFromSlug($request->input('slug'), 'AppManagerController');
        // If AppManagerController has an install method
        if (method_exists($_app, 'install')) {
            $_app->install();
        }
        // Install or Update the App
        $app = App::updateOrCreate(
            [
                'slug' => $request->input('slug')
            ],
            [
                'name' => $_app->name,
                'icon' => $_app->icon,
                'icon_color' => $_app->icon_color,
                'background_color' => $_app->background_color,
                'version' => $_app->version,
                'author' => $_app->author,
                'menu' => json_encode($_app->menu),
                'routes' => json_encode($_app->routes),
                'active' => 0
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "$app->name Downloaded and Installed",
            'apps' => (new AppsService())->getLocal(),
            'online' => (new AppsService())->getOnline()
        ]);
    }

    /**
     * Perform a controlling action on an App
     *
     * @param Request $request
     */
    public function control(Request $request)
    {
        $app = App::where('slug', $request->input('slug'))->first();
        switch ($request->input('task')) {
            case 'activate':
                $app->active = 1;
                $app->save();
                return response()->json([
                    'success' => true,
                    'message' => "$app->name Activated"
                ], 200);
                break;
            case 'deactivate':
                $app->active = 0;
                $app->save();
                return response()->json([
                    'success' => true,
                    'message' => "$app->name Deactivated"
                ], 200);
                break;
            case 'uninstall':
                // Create AppManagerController object
                $_app = App::createFromSlug($request->input('slug'), 'AppManagerController');
                $_name = $app->name;
                $app->delete();
                // If AppManagerController has an uninstall method
                if (method_exists($_app, 'uninstall')) {
                    $_app->uninstall();
                }
                (new AppsService())->rrmdir(App::path() . $request->input('slug'));
                return response()->json([
                    'success' => true,
                    'message' => "$_name Uninstalled",
                    'app' => (new AppsService())->getOnline($request->input('slug'))
                ], 200);
                break;
            case 'install':
                // Create AppManagerController object
                $_app = App::createFromSlug($request->input('slug'), 'AppManagerController');
                // If AppManagerController has an install method
                if (method_exists($_app, 'install')) {
                    $_app->install();
                }
                // Install the app by creating new
                $app = App::create([
                    'slug' => $request->input('slug'),
                    'name' => $_app->name,
                    'icon' => $_app->icon,
                    'icon_color' => $_app->icon_color,
                    'background_color' => $_app->background_color,
                    'version' => $_app->version,
                    'author' => $_app->author,
                    'menu' => json_encode($_app->menu),
                    'routes' => json_encode($_app->routes),
                    'active' => 0
                ]);
                return response()->json([
                    'success' => true,
                    'message' => "$_app->name Installed",
                    'app' => $app->toArray()
                ], 200);
        }
        
        return response()->json([
            'success' => false,
            'message' => "Unknown Task"
        ], 200);
    }
}
