<?php

namespace App\Providers;

use App\Transport\MSGraphMailTransport;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class MailServiceProvider extends ServiceProvider
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
        if (file_exists(storage_path('webapps/installed.json')) && Schema::hasTable('settings')) {
            $driver = ApplicationSettings::get('mail.driver', 'smtp');
            if ($driver === 'smtp') {
                $config = [
                    'driver' => 'smtp',
                    'host' => ApplicationSettings::get('mail.smtp.host'),
                    'port' => ApplicationSettings::get('mail.smtp.port'),
                    'from' => [
                        'address' => ApplicationSettings::get('mail.smtp.from_address'),
                        'name' => ApplicationSettings::get('mail.smtp.from_name'),
                    ],
                    'encryption' => ApplicationSettings::get('mail.smtp.encryption'),
                    'username' => ApplicationSettings::get('mail.smtp.username'),
                    'password' => ApplicationSettings::get('mail.smtp.password'),
                ];
                Config::set('mail', $config);
            } else if ($driver === 'msgraph') {
                $config = [
                    'driver' => 'msgraph',
                    'from' => [
                        'name' => null,
                        'address' => ApplicationSettings::get('mail.msgraph.from_address'),
                    ]
                ];
                Config::set('mail', $config);

                $this->app->get('mail.manager')->extend('msgraph', function() {
                    return new MSGraphMailTransport();
                });
            }
        }
    }
}
