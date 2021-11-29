<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OAuth2Controller;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BlocksController;
use App\Http\Controllers\Install\InstallController;
use App\Http\Controllers\Install\UserController;
use App\Http\Controllers\MSGraphController;
use App\Http\Controllers\Update\UpdateController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/**
 * Routes for Installation and Updates
 */
Route::group([
    'prefix' => 'install',
    'as' => 'Install::',
    'middleware' => ['can.install']
], function () {
    Route::get('/', [InstallController::class, 'start'])->name('start');
    Route::view('/database', 'install.database')->name('database');
    Route::get('/application', [InstallController::class, 'setup'])->name('application');
    Route::post('/application', [InstallController::class, 'setupSave'])->name('application.save');
    Route::get('/administrator', [UserController::class, 'administrator'])->name('administrator');
    Route::post('/administrator', [UserController::class, 'createAdministrator'])->name('administrator.create');
});
Route::group([
    'prefix' => 'install',
    'as' => 'Install::'
], function () {
    Route::get('/complete', [InstallController::class, 'finish'])->name('final');
});

Route::group([
    'prefix' => 'update',
    'as' => 'Update::',
    'middleware' => ['can.update']
], function () {
    Route::get('/', [UpdateController::class, 'start'])->name('start');
    Route::post('/login', [UpdateController::class, 'login'])->name('login');
    Route::get('/database', [UpdateController::class, 'database'])->name('database');
    Route::get('/database/update', [UpdateController::class, 'databaseUpdate'])->name('database.update');
    Route::get('/complete', [UpdateController::class, 'complete'])->name('complete');
});

/**
 * Route once installed or updated
 */
Route::middleware(['requires.install', 'requires.update'])->group(function () {
    // Auth Routes
    Route::get('/login', [LoginController::class, 'loginPage'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('loginPost');
    Route::get('/register', [RegisterController::class, 'registerPage'])->name('register');
    Route::post('/register', [RegisterController::class, 'register'])->name('registerPost');

    // Routes for Authentication via Azure
    Route::get('/login/oauth2/azure', [OAuth2Controller::class, 'redirectToProvider']);
    Route::get('/login/oauth2/azure/callback', [OAuth2Controller::class, 'handleProviderCallback']);

    // MS Graph callback routes
    Route::get('/graph/callback/register', [MSGraphController::class, 'handleRegister']);

    // View embedded block
    Route::get('/embed/{publicId}', [BlocksController::class, 'embed']);

    // Get a User Photo
    Route::get('/user/{user}/photo', [App\Http\Controllers\UserController::class, 'getPhoto']);

    // Wildcard React Route - needs to be below anything else
    Route::view('/{any}', 'app')->where('any', '^(?!api|apps\/.*\/view\b).*$');
});
