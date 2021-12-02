<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App as Laravel;

class App extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'slug',
        'active',
        'icon',
        'icon_color',
        'background_color',
        'version',
        'author',
        'menu',
        'routes'
    ];

    /**
     * Declare that timestamps are not in use.
     *
     * @var boolean
     */
    public $timestamps = false;

    /**
     * Allows finding by slug
     */
    public function scopeFindBySlug($query, $slug)
    {
        return $query->where('slug', '=', $slug);
    }

    /**
     * Get the Navigation items for this app
     *
     * @return array
     */
    public function navigation()
    {
        $menu = json_decode($this->menu, true);
        $navigation = [
            '_tag' => 'NavDropdown',
            'name' => $this->name,
            'to' => '/apps/' . $this->slug,
            'icon' => $this->icon
        ];
        if (is_array($menu)) {
            foreach ($menu as $item) {
                if (Auth::user()->hasPermissionTo($item['permission'])) {
                    $navigation['_children'][] = [
                        '_tag' => 'NavChild',
                        'name' => $item['text'],
                        'to' => $navigation['to'] . '/' . $item['action']
                    ];
                }
            }
        }
        return $navigation;
    }

    /**
     * Get the Routes for this app
     *
     * @return array
     */
    public function routes()
    {
        $_routes = json_decode($this->routes, true);
        $routes = [];
        if (is_array($_routes)) {
            foreach ($_routes as $route) {
                if (Auth::user()->hasPermissionTo($route['permission'])) {
                    $routes[] = [
                        'name' => $route['name'],
                        'exact' => $route['exact'],
                        'path' => '/apps/' . $this->slug . $route['path'],
                        'component' => 'ViewApp',
                        'file' => $route['component'],
                        'app' => $this->slug,
                    ];
                }
            }
        }
        return $routes;
    }

    /**
     * Get the absolute path to the Apps directory
     *
     * @return string
     */
    public static function path()
    {
        return storage_path('webapps/apps/');
    }

    /**
     * Create a new App object using the specified controller
     *
     * @var string App Slug
     * @var string Controller (optional)
     *
     * @return object
     */
    public static function createFromSlug($slug, $controller = "MasterController")
    {
        require_once self::path() . "$slug/Controllers/$controller.php";
        $class = "WebApps\\Apps\\$slug\\Controllers\\$controller";
        $app = new $class();
        return $app;
    }

    /**
     * TODO: This is repeated from AppsSerivceProvider->boot()
     * Is is actually needed? Possibly when enabling/disabling
     * an app to prevent a hard page reload.
     *
     * @codeCoverageIgnore
     */
    public static function loadSerivceProviders()
    {
        $apps = self::where('active', 1)->get();

        foreach ($apps as $app) {
            $serviceProvider = "WebApps\\Apps\\" . $app['slug'] . "\\Providers\\" . $app['slug'] ."ServiceProvider";
            if (class_exists($serviceProvider)) {
                Laravel::register($serviceProvider);
            }
        }
    }
}
