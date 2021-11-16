<?php

namespace App\Services\Install;

use Illuminate\Database\SQLiteConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Output\BufferedOutput;

class DatabaseInstallService
{
    /**
     * Validate database connection with user supplied details
     *
     * @return array
     */
    public function checkDatabaseConnection(array $request)
    {
        Config::set("database.connections.test", [
            'driver' => $request['DB_CONNECTION'],
            'host' => $request['DB_HOST'],
            'port' => $request['DB_PORT'],
            'database' => $request['DB_DATABASE'],
            'username' => $request['DB_USERNAME'],
            'password' => $request['DB_PASSWORD']
        ]);

        try {
            DB::connection('test')->getPdo();
            return ['success' => true];
        } catch (\Exception $exception) {
            return ['success' => false, 'reason' => $exception->getMessage()];
        }
    }

    /**
     * Check if the Database is SQLite, if so create the database file
     *
     * @param BufferedOutput $outputLog
     */
    private function sqlite(BufferedOutput $outputLog)
    {
        if (DB::connection() instanceof SQLiteConnection) {
            $database = DB::connection()->getDatabaseName();
            if (!file_exists($database)) {
                touch($database);
                DB::reconnect(Config::get('database.default'));
            }
            $outputLog->write('Using SQLite database: ' . $database, 1);
        }
    }
}
