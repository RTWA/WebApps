<?php

namespace App\Http\Controllers;

use GrahamCampbell\GitHub\Facades\GitHub;
use Illuminate\Support\Facades\Cache;

class AppController extends Controller
{
    public function getProductNameAndVersion()
    {
        return response()->json($this->readWebAppsJson(), 200);
    }

    public function checkUpdates()
    {
        Cache::forget('webapps_latest_release');
        $latest = Cache::remember('webapps_latest_release', now()->addDays(7), function () {
            return GitHub::repo()->releases()->latest('RTWA', 'WebApps');
        });

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
            $history = json_decode(file_get_contents(storage_path('webapps/installed.json')), true);
            unset($history['product']);
            unset($history['version']);

            return array_merge($product, $history);
        });
    }
}
