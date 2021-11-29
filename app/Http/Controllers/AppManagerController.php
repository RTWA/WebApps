<?php

namespace App\Http\Controllers;

use App\Models\User;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AppManagerController extends Controller
{
    public $name;
    public $slug;
    public $icon;
    public $version;
    public $author;

    public $menu;
    public $routes;

    private $manifest;

    public function __construct($manifest)
    {
        $this->manifest = $manifest;
        $this->name = $this->manifest['name'];
        $this->slug = $this->manifest['slug'];
        $this->icon = $this->manifest['icon'];
        $this->version = $this->manifest['version'];
        $this->author = $this->manifest['author'];
        $this->menu = $this->manifest['menu'];
        $this->routes = $this->manifest['routes'];
    }
    
    protected function createPermissions()
    {
        $admin = Role::findByName('Administrators', 'web');

        foreach ($this->manifest['permissions'] as $permission) {
            if (Permission::where('name', $permission['name'])
                    ->where('guard_name', $permission['guard'])
                    ->first() === null) {
                $p = Permission::create([
                    'name' => $permission['name'],
                    'title' => $permission['title'],
                    'guard_name' => $permission['guard'],
                ]);
                if ($permission['admin']) {
                    $admin->givePermissionTo($p);
                }
            }
        }
    }

    protected function dropPermissions()
    {
        foreach ($this->manifest['permissions'] as $permission) {
            $p = Permission::where('name', $permission['name'])
                ->where('guard_name', $permission['guard'])
                ->first();
            if ($p <> null) {
                // @codeCoverageIgnoreStart
                // Revoke direct user permissions
                $users = User::permission($permission['name'])->get();
                foreach ($users as $user) {
                    $user->revokePermissionTo($p);
                }
                // Revoke all role permissions
                $roles = Role::all();
                foreach ($roles as $role) {
                    $role->revokePermissionTo($permission);
                }
                
                $p->delete();
                // @codeCoverageIgnoreEnd
            }
        }
    }

    protected function createSettings()
    {
        foreach ($this->manifest['settings'] as $setting) {
            if (ApplicationSettings::get($setting['key']) === null) {
                ApplicationSettings::set($setting['key'], $setting['value']);
            }
        }
    }

    protected function dropSettings()
    {
        foreach ($this->manifest['settings'] as $setting) {
            ApplicationSettings::delete($setting['key']);
        }
    }
}
