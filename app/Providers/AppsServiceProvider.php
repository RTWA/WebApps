<?php

namespace App\Providers;

use App\Models\App;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        if (file_exists(storage_path('webapps/installed.json')) && Schema::hasTable('apps')) {
            $apps = App::where('active', 1)->get();
            foreach ($apps as $app) {
                $path = App::path() . $app['slug'] . "/Providers/" . $app['slug'] . "ServiceProvider.php";
                $serviceProvider = "WebApps\\Apps\\" . $app['slug'] . "\\Providers\\" . $app['slug'] . "ServiceProvider"; //phpcs:ignore

                if (!class_exists($serviceProvider) && file_exists($path)) {
                    include($path);
                }
                if (class_exists($serviceProvider)) {
                    $this->app->register($serviceProvider);
                }
            }
        }
    }
}
