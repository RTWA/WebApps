<?php

namespace App\Http\Controllers;

use App\Models\App;
use Illuminate\Support\Facades\Auth;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use RobTrehy\LaravelUserPreferences\UserPreferences;

class UIController extends Controller
{
    public function navigation()
    {
        $user = Auth::user();
        $apps = App::where('active', '=', true)->orderBy('name', 'asc')->get();
        $nav = [];
        $routes = $this->generateRoutes($apps);

        // phpcs:disable Generic.Files.LineLength
        $nav[] = [
            '_tag' => 'NavItem',
            'name' => 'Dashboard',
            'to' => '/dashboard',
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>',
        ];


        if ($user->hasPermissionTo('blocks.view')) {
            $nav[] = [
                '_tag' => 'NavTitle',
                'name' => 'Blocks'
            ];
            $nav[] = [
                '_tag' => 'NavItem',
                'name' => 'My Blocks',
                'to' => '/blocks',
                'icon' => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>',
            ];

            $nav[] = [
                '_tag' => 'NavItem',
                'name' => 'Shared Blocks',
                'to' => '/blocks/shared',
                'icon' => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>'
            ];

            if ($user->hasPermissionTo('blocks.create')) {
                $nav[] = [
                    '_tag' => 'NavItem',
                    'name' => 'Create new Block',
                    'to'  => '/blocks/new',
                    'icon' => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>',
                ];
            }
        }

        if ($user->hasPermissionTo('apps.use')) {
            if (count($apps) >= 1) {
                $nav[] = [
                    '_tag' => 'NavTitle',
                    'name' => 'Apps'
                ];
                foreach ($apps as $app) {
                    $nav[] = $app->navigation();
                }
            }
        }

        $nav[] = [
            '_tag' => 'NavTitle',
            'name' => '',
            'className' => 'md:hidden'
        ];

        $userChildren = [];
        if (ApplicationSettings::get('core.ui.dark_mode') === 'user' || ApplicationSettings::get('core.sidebar.color_mode', 'user') === 'user') {
            $userChildren[] = [
                '_tag' => 'NavChild',
                'name' => 'Preferences',
                'exact' => true,
                'to' => '/user/preferences',
            ];
        }
        if (!$user->azure_id) {
            $userChildren[] = [
                '_tag' => 'NavChild',
                'name' => 'Change Password',
                'exact' => true,
                'to' => '/user/password',
            ];
        }
        $userChildren[] = [
            '_tag' => 'NavChild',
            'name' => 'Sign out',
            'exact' => true,
            'to' => '/logout',
        ];

        $nav[] = [
            '_tag' => 'NavDropdown',
            'name' => $user->name,
            'route' => '/user/',
            'exact' => true,
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>',
            'className' => 'mt-auto',
            '_children' => $userChildren,
        ];

        if (ApplicationSettings::get('core.cms.display_link') === "true") {
            $nav[] = [
                '_tag' => 'NavItem',
                'name'    => ApplicationSettings::get("core.cms.text"),
                'href'     => ApplicationSettings::get("core.cms.url"),
                'icon'    => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>',
                'color' => 'blue',
            ];
        }

        if ($user->hasPermissionTo('admin.access')) {
            $nav[] = [
                '_tag' => 'NavItem',
                'name'    => 'WebApps Settings',
                'to'     => '/settings',
                'icon'    => '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>',
                'color' => 'red',
            ];
        }
        // phpcs:enable

        $updates = json_decode(ApplicationSettings::get('core.available.updates'), true);
        if (is_array($updates)) {
            $count = 0;
            if (isset($updates['WebApps'])) {
                $count++;
            }
            if (isset($updates['apps'])) {
                $count = $count + count($updates['apps']);
            }
            if (isset($updates['plugins'])) {
                $count = $count + count($updates['plugins']);
            }

            $nav[count($nav)-1]['badge'] =  [
                'color' => ApplicationSettings::get('core.ui.theme'),
                'text' => $count,
                'pill' => true,
                'className' => 'ml-auto',
            ];
        }

        return response()->json([
            'success' => true,
            'navigation' => $nav,
            'routes' => $routes,
            'sidebar' => [
                'color_mode' => $this->getSidebarColorMode()
            ],
            'envPermissions' => $this->checkEnvPermissions()
        ], 200);
    }

    private function generateRoutes($apps)
    {
        $user = Auth::user();

        $routes = array();
        $routes[] = array(
            'path'      => '/dashboard',
            'name'      => 'Dashboard',
            'component' => 'Dashboard',
        );

        if ($user->hasPermissionTo('blocks.view')) {
            $routes[] = array(
                'path'      => '/blocks',
                'name'      => 'Blocks',
                'exact'     => true,
                'component' => 'ViewBlocks',
            );
            if ($user->hasPermissionTo('blocks.view.others')) {
                $routes[] = array(
                    'path'      => '/blocks/user/:username',
                    'name'      => 'Users Blocks',
                    'exact'     => true,
                    'component' => 'ViewBlocks',
                );
            }
            $routes[] = array(
                'path'      => '/blocks/view/:id',
                'name'      => 'View Block',
                'exact'     => true,
                'component' => 'ViewBlock',
            );
            if ($user->hasPermissionTo('blocks.create')) {
                $routes[] = array(
                    'path'      => '/blocks/new',
                    'name'      => 'Create new Block',
                    'exact'     => true,
                    'component' => 'NewBlock',
                );
                $routes[] = array(
                    'path'      => '/blocks/edit/:id',
                    'name'      => 'Edit Block',
                    'exact'     => true,
                    'component' => 'EditBlock',
                );
            }
            $routes[] = [
                'path' => '/blocks/shared',
                'name' => 'Shared Blocks',
                'exact' => true,
                'component' => 'SharedBlocks',
            ];
        }

        if ($user->hasPermissionTo('apps.use')) {
            if (count($apps) >= 1) {
                $routes[] = array(
                    'path'      => '/apps',
                    'name'      => 'Apps',
                    'exact'     => true,
                    'component' => 'Dashboard',
                );
                foreach ($apps as $app) {
                    $routes = array_merge($routes, $app->routes());
                }
            }
        }

        $routes[] = array(
            'path' => '/user/preferences',
            'name' => 'User Preferences',
            'exact' => true,
            'component' => 'Preferences',
        );

        if (!$user->azure_id) {
            $routes[] = array(
                'path' => '/user/password',
                'name' => 'Change Password',
                'exact' => true,
                'component' => 'ChangePassword',
            );
        }

        if ($user->hasRole('Administrators')) {
            $routes[] = array(
                'path'      => '/settings',
                'name'      => 'Settings',
                'component' => 'Settings',
            );
        }

        return $routes;
    }

    /**
     * Check if .env is writable
     *
     * @codeCoverageIgnore
     */
    private function checkEnvPermissions()
    {
        if (!ApplicationSettings::get('webapps.ignore.env') && $this->checkWrite(base_path('.env'))) {
            return true;
        }

        return false;
    }

    /**
     * Check if specified file is writable
     *
     * @codeCoverageIgnore
     */
    private function checkWrite($file)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if (is_writable($file)) {
                return true;
            }
        } else {
            if (substr(decoct(fileperms(base_path('.env'))), -3) === "666") {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the color mode for the Sidebar
     */
    private function getSidebarColorMode()
    {
        if (ApplicationSettings::get('core.sidebar.color_mode', 'user') === 'user') {
            return UserPreferences::has('sidebar.color_mode') ? UserPreferences::get('sidebar.color_mode') : 'light';
        }

        return ApplicationSettings::get('core.sidebar.color_mode', 'user');
    }
}
