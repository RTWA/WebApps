<?php

namespace App\Services\Install;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cookie;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Symfony\Component\Console\Output\BufferedOutput;

class InstallManagerService
{
    /**
     *
     * @var BufferedOutput
     */
    protected $outputLog;

    /**
     * InstallManagerService constructor
     */
    public function __construct()
    {
        $this->outputLog = new BufferedOutput;
    }

    /**
     * Run the commands require to complete the install
     *
     * @return string
     */
    public function completeInstall($cache = true)
    {
        if ($cache && App::environment() !== 'testing') {
            // @codeCoverageIgnoreStart
            Artisan::call('config:cache', [], $this->outputLog);
            Artisan::call('view:cache', [], $this->outputLog);
            Artisan::call('storage:link', [], $this->outputLog);
            // @codeCoverageIgnoreEnd
        }
        $this->createSettings();
        $this->createInstalledFile();

        return $this->outputLog->fetch();
    }

    /**
     * Generate a new Laravel Application Key
     */
    public function generateKey()
    {
        try {
            Artisan::call('key:generate', ["--force" => true]);
            Cookie::forget('webapps_session');
            Cookie::forget('webapps_token');
            Cookie::forget('laravel_session');
            Cookie::forget('laravel_token');
        // @codeCoverageIgnoreStart
        } catch (\Exception $exception) {
            abort(500, $exception->getMessage);
        }
        // @codeCoverageIgnoreEnd
    }

    /**
     * Create the Installed File
     */
    private function createInstalledFile()
    {
        file_put_contents(
            storage_path('webapps/installed.json'),
            json_encode([
                'product' => config('installer.product.name'),
                'version' => config('installer.product.version'),
                'installed' => date('Y-m-d h:i:sa'),
            ])
        );
    }

    /**
     * Create the default settings
     */
    public function createSettings()
    {
        $settings = config('installer.create_settings');

        foreach ($settings as $setting) {
            if (!ApplicationSettings::has($setting['key'])) {
                ApplicationSettings::set($setting['key'], $setting['value']);
            }
        }
    }
}
