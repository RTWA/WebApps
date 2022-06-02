<?php

namespace App\Http\Controllers;

use GrahamCampbell\GitHub\Facades\GitHub;
use Illuminate\Support\Facades\Cache;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class AppController extends Controller
{
    public function getProductNameAndVersion()
    {
        return response()->json($this->readWebAppsJson(), 200);
    }

    public function getUpdateInfo()
    {
        $updates = json_decode(ApplicationSettings::get('core.available.updates'), true);
        return response()->json($updates, 200);
    }

    public function checkUpdates()
    {
        $latest = Cache::remember('webapps_latest_release', now()->addDays(1), function () {
            return GitHub::repo()->releases()->latest('RTWA', 'WebApps');
        });

        $updates = json_decode(ApplicationSettings::get('core.available.updates'), true);

        if (version_compare(
            str_replace("v", "", $latest['tag_name']),
            $this->readWebAppsJson()['app_version'],
            '>'
        ) && !isset($updates['WebApps'])) {
            $updates['WebApps'] = [
                'version' => $latest['tag_name'],
            ];
        } elseif (isset($updates['WebApps'])) {
            unset($updates['WebApps']);
        }
        ApplicationSettings::set('core.available.updates', json_encode($updates));


        return response()->json([
            'available' => version_compare(
                str_replace("v", "", $latest['tag_name']),
                $this->readWebAppsJson()['app_version'],
                '>'
            ),
            'version' => str_replace("v", "", $latest['tag_name']),
            'url' => $latest['html_url']
        ], 200);
    }

    public function clearCache()
    {
        Cache::flush();
        return response()->json([], 200);
    }

    private function readWebAppsJson()
    {
        return Cache::rememberForever('product.info', function () {
            $product = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);
            $history = (file_exists(storage_path('webapps/installed.json')))
                ? json_decode(file_get_contents(storage_path('webapps/installed.json')), true)
                : [];
            unset($history['product']);
            unset($history['version']);

            return array_merge($product, $history);
        });
    }
}
