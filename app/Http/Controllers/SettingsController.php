<?php

namespace App\Http\Controllers;

use App\Mail\TestMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class SettingsController extends Controller
{
    /**
     * Read an app setting by key
     *
     * @param $request Illuminate\Http\Request
     */
    public function read(Request $request)
    {
        if (is_array(json_decode($request->input('key'), true))) {
            $keys   = json_decode($request->input('key'), true);
            foreach ($keys as $key) {
                $return[$key] = ApplicationSettings::get($key);
            }
            return response()->json($return, 200);
        }

        if ($request->input('key') === "*" || is_null($request->input('key'))) {
            return response()->json(['settings' => ApplicationSettings::all()], 200);
        }

        return response()->json([$request->input('key') => ApplicationSettings::get($request->input('key'))], 200);
    }

    /**
     * Update an app setting key
     *
     * @param $request Illuminate\Http\Request
     * @param $key String
     */
    public function update(Request $request, $key)
    {
        $value = is_null($request->input('value')) ? '' : $request->input('value');
        if ($key !== "azure.graph.client_secret") {
            ApplicationSettings::set($key, $value);
        } else {
            // @codeCoverageIgnoreStart
            ApplicationSettings::set($key, Crypt::encryptString($value));
            // @codeCoverageIgnoreEnd
        }
        return response()->json(['success' => true, 'settings' => ApplicationSettings::all()], 201);
    }

    /**
     * Delete an app setting by key
     *
     * @param $key string
     */
    public function delete($key)
    {
        ApplicationSettings::delete($key);
        return response()->json(['success' => true, 'settings' => ApplicationSettings::all()], 200);
    }

    /**
     * Send test email to the specified email address
     *
     * @codeCoverageIgnore
     */
    public function sendTestEmail(Request $request)
    {
        try {
            $to = $request->input('to');
            Mail::to($to)->send(new TestMail());
            return response()->json([], 204);
        } catch (\Exception $e) {
            return response()->json(['exception' => $e->getMessage()], 500);
        }
    }

    /**
     * Return the two theme settings for Application Setup and Update UI
     */
    public function themeData()
    {
        return response()->json([
            'core.ui.theme' => ApplicationSettings::get('core.ui.theme', 'indigo'),
            'core.ui.dark_mode' => ApplicationSettings::get('core.ui.dark_mode', 'user'),
        ], 200);
    }

    /**
     * Update the theme colour from Application Setup and Update UI
     */
    public function setThemeColor(Request $request)
    {
        ApplicationSettings::set('core.ui.theme', $request->theme);

        return response(null, 204);
    }

    /**
     * Update the Dark Mode Option from Application Setup and Update UI
     */
    public function setDarkMode(Request $request)
    {
        ApplicationSettings::set('core.ui.dark_mode', $request->mode);

        return response(null, 204);
    }
}
