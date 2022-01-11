<?php

namespace App\Services;

use App\Models\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use ZipArchive;

class AppsService
{
    /**
     * Stores the processed repository data
     *
     * @var array
     */
    private $repoData;

    /**
     * Construct the AppsService
     */
    public function __construct()
    {
        $response = Cache::remember('repository:rawData', now()->addMinutes(60), function () {
            return $this->getRepository();
        });

        // Check the raw data contains the expected name data
        if (isset($response['name']) && isset($response['apps'])
            && $response['name'] === "WebApps Online Repository"
        ) {
            foreach ($response['apps'] as $app) {
                $this->repoData[$app['slug']] = $app;
            }
        } else {
            abort(500, "Invalid Repository Found");
        }
    }

    /**
     * Load and cache the repo data
     */
    private function getRepository()
    {
        $current_version = json_decode(
            file_get_contents(storage_path('webapps/core/webapps.json')),
            true
        )['app_version'];
        $response = Http::get('https://studio.getwebapps.uk/api/v1.0/repository/' . $current_version);

        return $response->json();
    }

    /**
     * Retrieve all locally available Apps
     *
     * @return array
     */
    public function getLocal()
    {
        $apps = App::all();
        // Find the Apps that are not installed
        $directories = glob(App::path() . '*', GLOB_ONLYDIR);
        foreach ($directories as $directory) {
            $exists = false;
            foreach ($apps as $i => $app) {
                if ($app['slug'] == str_replace(App::path(), '', $directory)) {
                    $exists = true;
                    $apps[$i]['hasUpdate'] = $this->checkForUpdate($app['slug'], $app['version']);
                    $apps[$i]['current_version'] = $app['version'];
                    $apps[$i]['installed'] =  true;

                    // @codeCoverageIgnoreStart
                    if ($apps[$i]['hasUpdate']) {
                        $apps[$i]['release'] = $this->repoData[$app['slug']]['release'];
                    }
                    // @codeCoverageIgnoreEnd
                }
            }
            if (!$exists) {
                if (file_exists("$directory/manifest.json")) {
                    $appData = json_decode(file_get_contents("$directory/manifest.json"), true);
                }
                $slug = str_replace(App::path(), '', $directory);
                $apps[] = [
                    'name' => isset($appData['name']) ? $appData['name'] : $slug,
                    'slug' => $slug,
                    'author' => isset($appData['author']) ? $appData['author'] : '',
                    'icon' => isset($appData['icon']) ? $appData['icon'] : "[\"fas\", \"star\"]",
                    'icon_color' => isset($appData['icon_color']) ? $appData['icon_color'] : '',
                    'background_color' => isset($appData['background_color']) ? $appData['background_color'] : '',
                    'active' => 0,
                    'version' => isset($appData['version']) ? $appData['version'] : '0.0.0',
                    'current_version' => isset($appData['version']) ? $appData['version'] : '0.0.0',
                    'downloaded' => true,
                    'installed' => false,
                ];
            }
        }
        return $apps;
    }

    /**
     * Provides an array of all Apps available online
     * Each will be marked with it's current installation state
     *
     * @param string|null Return just this Plugin
     *
     * @return array
     */
    public function getOnline($slug = null)
    {
        $current = $this->getLocal();
        // Mark already installed/downloaded Apps
        if ($this->repoData) {
            foreach ($this->repoData as $i => $app) {
                foreach ($current as $c) {
                    if ($app['slug'] === $c['slug'] && isset($c['installed'])) {
                        $this->repoData[$i]['installed'] = $c['installed'];
                        $this->repoData[$i]['hasUpdate'] = $this->checkForUpdate($c['slug'], $c['version']);
                        $this->repoData[$i]['current_version'] = $c['version'];
                        $this->repoData[$i]['active'] = $c['active'];
                    }
                    if ($app['slug'] === $c['slug'] && isset($c['downloaded'])) {
                        $this->repoData[$i]['downloaded'] = $c['downloaded'];
                    }
                }
            }
        }

        return ($slug) ? $this->repoData[$slug] : $this->repoData;
    }

    /**
     * Download and extract an App zip file
     *
     * @param string App Slug
     */
    public function downloadExtract($slug)
    {
        if (!isset($this->repoData[$slug])) {
            abort(404, 'App not found in Repository');
        }

        $app = $this->repoData[$slug];
        $_app = App::findBySlug($slug)->first();

        $tmpFileName = 'tmp_' . $app['slug'] . time() . '.zip';
        $tmpFile = storage_path('/' . $tmpFileName);
        $this->downloadRemoteZip($app['release']['download_url'], $tmpFile);

        $zip = new ZipArchive();
        if ($zip->open($tmpFile)) {
            $zip->extractTo(App::path() . $app['slug'] . '/');
            $zip->close();
        } else {
            // @codeCoverageIgnoreStart
            abort(500, 'Unable to open ZIP file: ' . $tmpFile);
            // @codeCoverageIgnoreEnd
        }
        unlink($tmpFile);

        if ($_app <> null) {
            // The App was updated, so update database
            $_app->name = $app['name'];
            $_app->version = (isset($app['version']) ? $app['version'] : $app['release']['version']);
            $_app->icon = $app['icon'];
            $_app->icon_color = $app['icon_color'];
            $_app->background_color = $app['background_color'];
            $_app->author = $app['author'];
            $_app->save();
        }

        return true;
    }

    /**
     * Checks if an updated version is available for an already installed App
     *
     * @param string $slug Slug of the App
     *
     * @return bool
     */
    public function checkForUpdate($slug, $version)
    {
        return isset($this->repoData[$slug])
            ? version_compare($this->repoData[$slug]['release']['version'], $version, '>')
            : false;
    }

    /**
     * Recursively delete a directory and contents
     * # https://www.php.net/manual/en/function.rmdir.php#117354
     */
    public function rrmdir($src)
    {
        $dir = opendir($src);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                $full = $src . '/' . $file;
                if (is_dir($full)) {
                    $this->rrmdir($full);
                } else {
                    unlink($full);
                }
            }
        }
        closedir($dir);
        rmdir($src);
    }

    /**
     * Download remote file
     * # https://stackoverflow.com/a/6348811
     */
    private function downloadRemoteZip($remoteFile, $downloadTo)
    {
        set_time_limit(0);
        $file = fopen($downloadTo, 'w+');

        $curl = curl_init();

        // Update as of PHP 5.4 array() can be written []
        curl_setopt_array($curl, [
            CURLOPT_URL            => $remoteFile,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_FILE           => $file,
            CURLOPT_TIMEOUT        => 50,
            CURLOPT_USERAGENT      => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)'
        ]);

        // @codeCoverageIgnoreStart
        if (!curl_exec($curl)) {
            throw new \Exception('Curl error: ' . curl_error($curl));
        }
        // @codeCoverageIgnoreEnd
    }
}
