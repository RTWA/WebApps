<?php

use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

$webapps = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);

return [

    'dsn' => env('SENTRY_LARAVEL_DSN', 'https://0f72a34fc9dc4fda8bd8c94509bc65ec@o939163.ingest.sentry.io/5889159'),

    // capture release as git sha
    // 'release' => trim(exec('git --git-dir ' . base_path('.git') . ' log --pretty="%h" -n1 HEAD')),
    'release' => $webapps['app_name'] . '@' . $webapps['app_version'],

    // When left empty or `null` the Laravel environment will be used
    'environment' => env('SENTRY_ENVIRONMENT'),

    'server_name' => '',

    'breadcrumbs' => [
        // Capture Laravel logs in breadcrumbs
        'logs' => true,

        // Capture SQL queries in breadcrumbs
        'sql_queries' => true,

        // Capture bindings on SQL queries logged in breadcrumbs
        'sql_bindings' => false,

        // Capture queue job information in breadcrumbs
        'queue_info' => true,

        // Capture command information in breadcrumbs
        'command_info' => true,
    ],

    'tracing' => [
        // Trace queue jobs as their own transactions
        'queue_job_transactions' => env('SENTRY_TRACE_QUEUE_ENABLED', false),

        // Capture queue jobs as spans when executed on the sync driver
        'queue_jobs' => true,

        // Capture SQL queries as spans
        'sql_queries' => true,

        // Try to find out where the SQL query originated from and add it to the query spans
        'sql_origin' => true,

        // Capture views as spans
        'views' => true,

        // Indicates if the tracing integrations supplied by Sentry should be loaded
        'default_integrations' => true,
    ],

    // @see: https://docs.sentry.io/platforms/php/configuration/options/#send-default-pii
    'send_default_pii' => false,

    'traces_sample_rate' => (float)(env('SENTRY_TRACES_SAMPLE_RATE', 0.0)),
    // 'traces_sample_rate' => (float)(ApplicationSettings::get('core.analytics.optIn') ? 0.25 : 0.0),

    'controllers_base_namespace' => env('SENTRY_CONTROLLERS_BASE_NAMESPACE', 'App\\Http\\Controllers'),

];
