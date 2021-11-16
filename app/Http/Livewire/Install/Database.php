<?php

namespace App\Http\Livewire\Install;

use App\Services\Install\DatabaseInstallService;
use App\Services\Install\EnvironmentInstallService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Livewire\Component;
use Symfony\Component\Console\Output\BufferedOutput;

class Database extends Component
{
    private $outputLog;

    public $outputTitle;
    public $outputString;
    public $status = 'success';

    public $DB_CONNECTION;
    public $DB_HOST;
    public $DB_PORT;
    public $DB_DATABASE;
    public $DB_USERNAME;
    public $DB_PASSWORD;

    public $show = 'form';
    public $showSampleDataButton = false;
    public $complete = false;

    public function mount()
    {
        $this->DB_CONNECTION = env('DB_CONNECTION', 'mysql');
        $this->DB_HOST = env('DB_HOST', 'localhost');
        $this->DB_PORT = env('DB_PORT', '3306');
        $this->DB_DATABASE = env('DB_DATABASE', 'webapps');
        $this->DB_USERNAME = env('DB_USERNAME');
        $this->DB_PASSWORD = env('DB_PASSWORD');
    }

    public function hydrate()
    {
        if (!$this->outputLog) {
            $this->outputLog = new BufferedOutput;
        }
    }

    public function submitForm()
    {
        $rules = [
            'DB_CONNECTION' => 'required|string|max:50',
            'DB_HOST' => 'required|string|max:50',
            'DB_PORT' => 'string',
            'DB_DATABASE' => 'required|string|max:50',
            'DB_USERNAME' => 'required|string|max:50',
        ];
        if (!config('installer.database.allowEmptyPassword')) {
            $rules['DB_PASSWORD'] = 'required|string|max:50';
        }
        $messages = [
            'required' => 'This field is required'
        ];

        $validatedData = $this->validate($rules, $messages);
        $validatedData['DB_PASSWORD'] = $this->DB_PASSWORD;

        $this->checkConnectionAndSave($validatedData);
    }

    public function checkConnectionAndSave($validatedData)
    {
        // Once validation has passed, check a connection to the database is possible
        $test = (new DatabaseInstallService())->checkDatabaseConnection($validatedData);
        if (!$test['success']) {
            $this->addError('DB_CONNECTION', "Could not connect to the database - " . $test['reason']);
            return;
        }
        $this->show = 'output';

        $this->outputTitle = "Saving Settings";
        // Save to .env
        $envService = new EnvironmentInstallService();
        foreach ($validatedData as $key => $value) {
            if ($key !== "_token") {
                $envService->set($key, $value);
            }
        }

        // Override running config
        Artisan::call('config:clear', [], $this->outputLog);
        $this->outputString .= $this->outputLog->fetch();
        $this->outputString .= "Configuration updated!\r\n";

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

        $this->migrateAndSeedDatabase();
    }

    public function migrateAndSeedDatabase()
    {
        Artisan::call('migrate', ["--force" => true], $this->outputLog);
        $this->outputString .= $this->outputLog->fetch();

        Artisan::call('db:seed', ["--force" => true], $this->outputLog);
        $this->outputString .= $this->outputLog->fetch();

        $this->outputTitle = "Database Setup Complete!";
        $this->showSampleDataButton = true;
    }

    public function installSampleData()
    {
        $this->showSampleDataButton = false;

        $this->outputTitle = "Installing Sample Data";
        $this->outputString = "Creating User Accounts\r\n";
        $this->seedUsers();
    }

    private function seedUsers()
    {
        Artisan::call('db:seed', ["--class" => 'UserSeeder', "--force" => true], $this->outputLog);
        $this->outputString .= $this->outputLog->fetch();
        
        $this->outputString .= "Creating Sample Blocks\r\n";
        $this->seedBlocks();
    }

    private function seedBlocks()
    {
        Artisan::call('db:seed', ["--class" => 'BlockSeeder', "--force" => true], $this->outputLog);
        $this->outputString .= $this->outputLog->fetch();
        $this->outputTitle = "Installed Sample Data!";
        $this->complete = true;
    }

    public function render()
    {
        return view('livewire.install.database');
    }
}
