<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Schema;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    public function report(Throwable $exception)
    {
        if (file_exists(storage_path('webapps/installed.json')) && Schema::hasTable('settings')) {
            if (app()->environment('production') &&
                app()->bound('sentry') &&
                $this->shouldReport($exception) &&
                ApplicationSettings::get('core.error.reporting') == "true"
            ) {
                app('sentry')->captureException($exception);
            }
        }

        parent::report($exception);
    }
}
