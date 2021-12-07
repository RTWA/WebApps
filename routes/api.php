<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\AppsController;
use App\Http\Controllers\BlocksController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MSGraphController;
use App\Http\Controllers\PluginsController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UIController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::post('/logout', [LoginController::class, 'logout']);

Route::group(
    ['middleware' => 'auth:sanctum'],
    function () {
        // Settings
        Route::post('/setting', [SettingsController::class, 'read']);
        Route::put('/setting/{key}', [SettingsController::class, 'update']);
        Route::delete('/setting/{key}', [SettingsController::class, 'delete']);
        Route::post('/email/test', [SettingsController::class, 'sendTestEmail']);

        // UI
        Route::get('/navigation', [UIController::class, 'navigation']);

        // App Settings
        Route::get('/product', [AppController::class, 'getProductNameAndVersion']);
        Route::get('/update-check', [AppController::class, 'checkUpdates']);

        // Security Settings
        Route::get('/groups', [SecurityController::class, 'groups']);
        Route::post('/group', [SecurityController::class, 'createGroup']);
        Route::patch('/group', [SecurityController::class, 'renameGroup']);
        Route::delete('/group', [SecurityController::class, 'deleteGroup']);
        Route::get('/group/mappings', [SecurityController::class, 'getGroupMappings']);
        Route::post('/group/mapping', [SecurityController::class, 'setGroupMapping']);
        Route::get('/permissions', [SecurityController::class, 'permissions']);
        Route::post('/permissions', [SecurityController::class, 'changePermission']);
        Route::post('/permissions/user', [SecurityController::class, 'toggleUserPermission']);
        Route::post('/permissions/group', [SecurityController::class, 'toggleGroupPermission']);
        Route::post('/permissions/search', [SecurityController::class, 'searchPermissions']);
        Route::post('/permitted', [SecurityController::class, 'getPermittedUsers']);
        Route::post('/permission/check', [SecurityController::class, 'checkUserPermission']);

        // User Settings
        Route::get('/users', [UserController::class, 'allUsersWithGroups']);
        Route::get('/users/all', [UserController::class, 'allUsersWithGroupsAndDisabled']);
        Route::get('/users/disabled', [UserController::class, 'onlyDisabledUsersWithGroups']);
        Route::post('/user/group', [UserController::class, 'changeGroup']);
        Route::post('/user/token', [UserController::class, 'createAccessToken']);
        Route::put('/user/preference', [UserController::class, 'setPreference']);
        Route::post('/user', [UserController::class, 'create']);
        Route::delete('/user/{user}', [UserController::class, 'softDelete']);
        Route::get('/user/{user}/enable', [UserController::class, 'undoDelete']);
        Route::delete('/user/{user}/hard', [UserController::class, 'delete']);
        Route::post('/user/password', [UserController::class, 'changePassword']);
        Route::post('/admin/user.password/reset', [UserController::class, 'adminResetPassword']);

        // Blocks
        Route::get('/blocks', [BlocksController::class, 'index']);
        Route::get('/blocks/count', [BlocksController::class, 'count']);
        Route::get('/blocks/views', [BlocksController::class, 'views']);
        Route::get('/blocks/user/{username}', [BlocksController::class, 'index']);
        Route::get('/blocks/{publicId}', [BlocksController::class, 'show']);
        Route::put('/blocks/{publicId}', [BlocksController::class, 'update']);
        Route::delete('/blocks/{publicId}', [BlocksController::class, 'delete']);
        Route::post('/blocks/{publicId}/chown', [BlocksController::class, 'chown']);

        // Plugins
        Route::get('/plugins', [PluginsController::class, 'all']);
        Route::get('/plugins/active', [PluginsController::class, 'active']);
        Route::post('/plugins/toggle', [PluginsController::class, 'toggle']);
        Route::delete('/plugin', [PluginsController::class, 'uninstall']);

        // Apps
        Route::get('/apps', [AppsController::class, 'all']);
        Route::post('/apps/control', [AppsController::class, 'control']);

        // Online Repository Routes
        Route::group(['prefix' => '/online'], function () {
            Route::get('/apps/list', [AppsController::class, 'online']);
            Route::post('/apps/download', [AppsController::class, 'download']);
            Route::get('/plugins/list', [PluginsController::class, 'online']);
            Route::post('/plugins/download', [PluginsController::class, 'download']);
        });

        // Media Routes
        Route::post('/media/upload', [MediaController::class, 'store']);

        // MS Graph/Azure Routes
        Route::get('/graph/token', [MSGraphController::class, 'getAccessToken']);
        Route::get('/azure/sync', [MSGraphController::class, 'syncUsersAndGroups']);

        Route::get('/user', function (Request $request) {
            return $request->user();
        });
    }
);
