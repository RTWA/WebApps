<?php

namespace App\Http\Controllers;

use App\Models\AppsScheduler;
use App\Models\ErrorLog;
use GrahamCampbell\GitHub\Facades\GitHub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class AppController extends Controller
{
    public function getErrorLog()
    {
        return response()->json([
            'logs' => ErrorLog::all()
        ], 200);
    }

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
            // @codeCoverageIgnoreStart
            $updates['WebApps'] = [
                'version' => $latest['tag_name'],
            ];
            // @codeCoverageIgnoreEnd
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

    public function getSystemTasks()
    {
        $tasks = [
            'cleanUpLog' => [
                'lastRun' => ApplicationSettings::get('tasks.cleanUpLog.lastRun'),
                'schedule' => [1, 'day'],
                'command' => 'cleanup:errorLog',
            ],
            'cleanUpMedia' => [
                'lastRun' => ApplicationSettings::get('tasks.cleanUpMedia.lastRun'),
                'lastQty' => ApplicationSettings::get('tasks.cleanUpMedia.lastQty'),
                'schedule' => [7, 'days'],
                'command' => 'webapps:cleanup-media',
            ],
            'azure' => [
                'sync' => [
                    'lastRun' => ApplicationSettings::get('azure.graph.last_sync'),
                    'schedule' => [30, 'minutes'],
                    'command' => 'azure:sync',
                ],
                'cleanup' => [
                    'lastRun' => ApplicationSettings::get('azure.graph.cleanup'),
                    'schedule' => [1, 'hour'],
                    'command' => 'cleanup:msgraph',
                ],
            ],
            'appsTasks' => AppsScheduler::all()->toArray()
        ];

        return response()->json([
            'tasks' => $tasks
        ], 200);
    }

    public function runTask(Request $request)
    {
        Artisan::call($request->input('command'));

        return $this->getSystemTasks();
    }

    private function readWebAppsJson()
    {
        return Cache::rememberForever('product.info', function () {
            $product = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);
            $history = (file_exists(storage_path('webapps/installed.json')))
                // @codeCoverageIgnoreStart
                ? json_decode(file_get_contents(storage_path('webapps/installed.json')), true)
                // @codeCoverageIgnoreEnd
                : [];
            unset($history['product']);
            unset($history['version']);

            return array_merge($product, $history);
        });
    }
}
