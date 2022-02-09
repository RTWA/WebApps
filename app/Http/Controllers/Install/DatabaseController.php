<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Services\Install\DatabaseInstallService;
use App\Services\Install\EnvironmentInstallService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Console\Output\BufferedOutput;

class DatabaseController extends Controller
{
    public $outputLog;

    public function __construct()
    {
        $this->outputLog = new BufferedOutput();
    }
    public function getCurrentEnvironment()
    {
        return response()->json([
            'DB_CONNECTION' => env('DB_CONNECTION', 'mysql'),
            'DB_HOST' => env('DB_HOST', 'localhost'),
            'DB_PORT' => env('DB_PORT', '3306'),
            'DB_DATABASE' => env('DB_DATABASE', 'webapps'),
            'DB_USERNAME' => env('DB_USERNAME'),
            'DB_PASSWORD' => env('DB_PASSWORD'),
        ], 200);
    }

    public function setNewEnvironment(Request $request)
    {
        $rules = [
            'DB_CONNECTION' => 'required|string|max:50',
            'DB_HOST' => 'required|string|max:50',
            'DB_PORT' => 'string|nullable',
            'DB_DATABASE' => 'required|string|max:50',
            'DB_USERNAME' => 'required|string|max:50',
            'DB_PASSWORD' => 'string|max:50|nullable',
        ];
        if (!config('installer.database.allowEmptyPassword')) {
            $rules['DB_PASSWORD'] = 'required|string|max:50';
        }
        $messages = [
            'required' => 'This field is required',
            'string' => 'This field is not valid',
        ];

        $validatedData = $request->validate($rules, $messages);

        // Once validation has passed, check a connection to the database is possible
        $test = (new DatabaseInstallService())->checkDatabaseConnection($validatedData);
        if (!$test['success']) {
            throw ValidationException::withMessages([
                'DB_CONNECTION' => "Could not connect to the database - " . $test['reason']
            ]);
        }

        $outputTitle = "Saving Settings";
        // Save to .env
        $envService = new EnvironmentInstallService();
        foreach ($validatedData as $key => $value) {
            if ($key !== "_token") {
                $envService->set($key, $value);
            }
        }

        // Override running config
        Artisan::call('config:clear', [], $this->outputLog);
        $outputString = $this->outputLog->fetch();
        $outputString .= "Configuration updated!\r\n";

        $newConn = config('database.connections.' . $validatedData['DB_CONNECTION']);
        $newConn['host'] = $validatedData['DB_HOST'];
        $newConn['port'] = $validatedData['DB_PORT'];
        $newConn['database'] = $validatedData['DB_DATABASE'];
        $newConn['username'] = $validatedData['DB_USERNAME'];
        $newConn['password'] = $validatedData['DB_PASSWORD'];

        Config::set([
            'database.connections.' . $validatedData['DB_CONNECTION'] => $newConn,
            'database.default' => $validatedData['DB_CONNECTION']
        ]);
        DB::reconnect($validatedData['DB_CONNECTION']);

        return response()->json(['title' => $outputTitle, 'body' => $outputString], 201);
    }

    public function migrateAndSeed()
    {
        Artisan::call('migrate', ["--force" => true], $this->outputLog);
        $outputString = $this->outputLog->fetch();

        Artisan::call('db:seed', ["--force" => true], $this->outputLog);
        $outputString .= $this->outputLog->fetch();

        return response()->json([
            'title' => "Database Setup Complete!",
            'body' => $outputString,
        ], 200);
    }

    public function installSampleData()
    {
        $string = "Creating User Accounts\r\n";        
        Artisan::call('db:seed', ["--class" => 'UserSeeder', "--force" => true], $this->outputLog);
        $string .= $this->outputLog->fetch();
        
        $string .= "Creating Sample Blocks\r\n";        
        Artisan::call('db:seed', ["--class" => 'BlockSeeder', "--force" => true], $this->outputLog);
        $string .= $this->outputLog->fetch();

        return response()->json([
            'title' => "Installed Sample Data!",
            'body' => $string
        ], 200);
    }
}
