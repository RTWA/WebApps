<?php

namespace App\Http\Controllers;

use App\Models\Plugin;
use App\Services\PluginsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PluginsController extends Controller
{
    /**
     * Returns a list of all Plugins available in the Plugins directory.
     */
    public function all()
    {
        return response()->json([
            'success' => true,
            'plugins' => (new PluginsService())->getLocal()
        ], 200);
    }

    /**
     * Returns a list of active Plugins.
     */
    public function active()
    {
        if (!Auth::user()->hasPermissionTo('blocks.create')) {
            abort(403, 'You do not have permission to access this page');
        }

        return response()->json([
            'success' => true,
            'plugins' => Plugin::where('state', '=', 1)->get()
        ], 200);
    }

    /**
     * Returns a list of Plugins available online
     */
    public function online()
    {
        if (!Auth::user()->hasPermissionTo('admin.access')) {
            abort(403, 'You do not have permission to install Plugins');
        }
        return response()->json([
            'success' => true,
            'plugins' => (new PluginsService())->getOnline()
        ]);
    }

    /**
     * Download and Extract a Plugin from Online Repository
     */
    public function download(Request $request)
    {
        (new PluginsService())->downloadExtract($request->input('slug'));
        
        return response()->json([
            'success' => true,
            'message' => 'Plugin downloaded',
            'plugins' => (new PluginsService())->getLocal(),
            'online' => (new PluginsService())->getOnline()
        ]);
    }

    /**
     * Uninstalls (deletes) the files for a specified Plugin
     */
    public function uninstall(Request $request)
    {
        $plugin = Plugin::findBySlug($request->input('slug'))->first();

        if ($plugin <> null) {
            if ($plugin->number_of_blocks <> 0 && $plugin->state) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plugin is in use. You cannot uninstall it.'
                ], 406);
            } elseif ($plugin->state && !request('confirm', false)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plugin is active. Are you sure you wish to deactivate and uninstall it?',
                    'blocks' => $plugin->number_of_blocks
                ], 406);
            } else {
                $plugin->delete();
            }
        }

        (new PluginsService())->rrmdir(Plugin::path().$request->input('slug'));

        return response()->json([
            'success' => true,
            'message' => 'Plugin has been uninstalled',
            'plugin' => (new PluginsService())->getOnline($request->input('slug'))
        ], 200);
    }

    /**
     * Toggles the status of a Plugin and installs the Plugin if it is not already
     */
    public function toggle(Request $request)
    {
        $plugin = Plugin::findBySlug($request->input('slug'))->first();

        if ($plugin <> null) {
            // Plugin is installed, toggle state
            $plugin->state = !$plugin->state;
            $plugin->save();
        } else {
            // Plugin not installed, install and set active
            $_plugin = Plugin::createFromSlug($request->input('slug'));
            $plugin = Plugin::create([
                'name' => $_plugin->name,
                'icon' => $_plugin->icon,
                'icon_color' => $_plugin->icon_color,
                'background_color' => $_plugin->background_color,
                'slug' => $request->input('slug'),
                'version' => $_plugin->version,
                'author' => $_plugin->author,
                'state' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Plugin updated",
            'plugin' => $plugin->toArray()
        ], 200);
    }
}
