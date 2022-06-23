<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use ZipArchive;

class PluginsService
{
    /**
     * Stores the processed repository data
     *
     * @var array
     */
    private $repoData;

    /**
     * Construct the PluginsService
     */
    public function __construct()
    {
        $response = Cache::remember('repository:rawData', now()->addMinutes(60), function () {
            return $this->getRepository();
        });

        // Check the raw data contains the expected name data
        if (isset($response['name']) && isset($response['plugins'])
            && $response['name'] === "WebApps Online Repository"
        ) {
            foreach ($response['plugins'] as $plugin) {
                $this->repoData[$plugin['slug']] = $plugin;
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
     * Retrieve all locally available Plugins
     *
     * @return array
     */
    public function getLocal()
    {
        $plugins = Plugin::all();
        // Find the Plugins that are not installed
        $directories = glob(Plugin::path() . '*', GLOB_ONLYDIR);
        foreach ($directories as $directory) {
            $exists = false;
            foreach ($plugins as $i => $plugin) {
                if ($plugin['slug'] == str_replace(Plugin::path(), '', $directory)) {
                    $exists = true;
                    $plugins[$i]['hasUpdate'] = $this->checkForUpdate($plugin['slug'], $plugin['version']);
                    $plugins[$i]['current_version'] = $plugin['version'];
                    $plugins[$i]['installed'] =  true;

                    // @codeCoverageIgnoreStart
                    if ($plugins[$i]['hasUpdate']) {
                        $plugins[$i]['release'] = $this->repoData[$plugin['slug']]['release'];
                        $this->addToUpdateList($plugin['slug']);
                    } else {
                        $this->removeFromUpdateList($plugin['slug']);
                    }
                    // @codeCoverageIgnoreEnd
                }
            }
            if (!$exists) {
                if (file_exists("$directory/plugin.json")) {
                    $pluginData = json_decode(file_get_contents("$directory/plugin.json"), true);
                }
                $slug = str_replace(Plugin::path(), '', $directory);
                $plugins[] = [
                    'name' => isset($pluginData['name']) ? $pluginData['name'] : $slug,
                    'slug' => $slug,
                    'author' => isset($pluginData['author']) ? $pluginData['author'] : '',
                    'icon' => isset($pluginData['icon']) ? $pluginData['icon'] : ['fas', 'star'],
                    'icon_color' => isset($pluginData['icon_color']) ? $pluginData['icon_color'] : '',
                    'background_color' => isset($pluginData['background_color']) ? $pluginData['background_color'] : '',
                    'state' => 0,
                    'version' => isset($pluginData['version']) ? $pluginData['version'] : '0.0.0',
                    'current_version' => isset($pluginData['version']) ? $pluginData['version'] : '0.0.0',
                    'downloaded' => true
                ];
            }
        }
        return $plugins;
    }

    /**
     * Provides an array of all Plugins available online
     * Each will be marked with it's current installation state
     *
     * @param string|null Return just this Plugin
     *
     * @return array
     */
    public function getOnline($slug = null)
    {
        $current = $this->getLocal();
        // Mark already installed/downloaded Plugins
        if ($this->repoData) {
            foreach ($this->repoData as $i => $plugin) {
                foreach ($current as $c) {
                    if ($plugin['slug'] === $c['slug'] && isset($c['installed'])) {
                        $this->repoData[$i]['installed'] = $c['installed'];
                        $this->repoData[$i]['hasUpdate'] = $this->checkForUpdate($c['slug'], $c['version']);
                        $this->repoData[$i]['current_version'] = $c['version'];
                        $this->repoData[$i]['state'] = $c['state'];
                    }
                    if ($plugin['slug'] === $c['slug'] && isset($c['downloaded'])) {
                        $this->repoData[$i]['downloaded'] = $c['downloaded'];
                    }
                }
            }
        }

        return ($slug) ? $this->repoData[$slug] : $this->repoData;
    }

    /**
     * Download and extract a Plugin zip file
     *
     * @param string Plugin Slug
     */
    public function downloadExtract($slug)
    {
        if (!isset($this->repoData[$slug])) {
            abort(404, 'Plugin not found in Repository');
        }

        $plugin = $this->repoData[$slug];
        $_plugin = Plugin::findBySlug($slug)->first();

        $tmpFileName = 'tmp_' . $plugin['slug'] . time() . '.zip';
        $tmpFile = storage_path('/' . $tmpFileName);
        $this->downloadRemoteZip($plugin['release']['download_url'], $tmpFile);

        $zip = new ZipArchive();
        if ($zip->open($tmpFile)) {
            $zip->extractTo(Plugin::path() . $plugin['slug'] . '/');
            $zip->close();
        } else {
            // @codeCoverageIgnoreStart
            abort(500, 'Unable to open ZIP file: ' . $tmpFile);
            // @codeCoverageIgnoreEnd
        }
        unlink($tmpFile);

        if ($_plugin <> null) {
            // The Plugin was updated, so update database
            $_plugin->name = $plugin['name'];
            $_plugin->version = (isset($plugin['version']) ? $plugin['version'] : $plugin['release']['version']);
            $_plugin->icon = $plugin['icon'];
            $_plugin->icon_color = $plugin['icon_color'];
            $_plugin->background_color = $plugin['background_color'];
            $_plugin->author = $plugin['author'];
            $_plugin->save();
        }

        $this->removeFromUpdateList($slug);

        return true;
    }

    /**
     * Checks if an updated version is available for an already installed Plugin
     *
     * @param string $slug Slug of the plugin
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
     * Adds Plugin data to the Updates List
     */
    private function addToUpdateList($slug)
    {
        $updates = json_decode(ApplicationSettings::get('core.available.updates'), true);

        if (!isset($updates['plugins'])) {
            $updates['plugins'] = [];
        }

        if (!in_array($slug, $updates['plugins'])) {
            $updates['plugins'][$slug] = [
                'version' => $this->repoData[$slug]['latest']['version'],
                'changelog' => $this->repoData[$slug]['latest']['changelog']
            ];
            ApplicationSettings::set('core.available.updates', json_encode($updates));
        }
    }

    /**
     * Removes Plugin data to the Updates List
     */
    private function removeFromUpdateList($slug)
    {
        $updates = json_decode(ApplicationSettings::get('core.available.updates'), true);

        if (!isset($updates['plugins'])) {
            $updates['plugins'] = [];
        }

        if (in_array($slug, $updates['plugins'])) {
            unset($updates['plugins'][$slug]);
            ApplicationSettings::set('core.available.updates', json_encode($updates));
        }
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
