<?php

$webapps = json_decode(file_get_contents(storage_path('webapps/core/webapps.json')), true);

return [

    'product' => [
        'name' => $webapps['app_name'],
        'version' => $webapps['app_version'],
    ],
    'database' => [
        'allowEmptyPassword' => true,
        'seed' => [
            Database\Seeders\RolePermissionsSeeder::class,
            Database\Seeders\SettingsSeeder::class,
        ],
    ],
    'core' => [
        'minPhpVersion' => '7.4',
    ],
    'requirements' => [
        'php' => [
            'OpenSSL',
            'PDO',
            'Mbstring',
            'Tokenizer',
            'XML',
            'Ctype',
            'JSON',
            'BCmath',
            'cURL',
        ],
        'apache' => [
            'mod_rewrite',
        ],
    ],
    'permissions' => [
        'storage/framework/' => '775',
        'storage/logs/' => '775',
        'storage/app/' => '775',
        'storage/webapps/' => '775',
        'bootstrap/cache/' => '775',
        '.env' => '666',
    ],
    'create_permissions' => [
        /**
         * admin.access must come first
         */
        [
            'name' => 'admin.access',
            'title' => 'Access Administrative Options',
            'guard' => 'web',
        ],
        [
            'name' => 'blocks.view',
            'title' => 'View Own Blocks',
            'guard' => 'web',
        ],
        [
            'name' => 'blocks.create',
            'title' => 'Create New Blocks',
            'guard' => 'web',
        ],
        [
            'name' => 'blocks.view.others',
            'title' => 'View Other Users Blocks',
            'guard' => 'web',
        ],
        [
            'name' => 'apps.use',
            'title' => 'Use Active Apps',
            'guard' => 'web',
        ],
    ],
    'create_settings' => [
        [
            'key' => 'auth.internal.registrations',
            'value' => 'true',
        ],
        [
            'key' => 'auth.internal.default_group',
            'value' => 'Standard Users',
        ],
        [
            'key' => 'auth.login.default_method',
            'value' => 'internal'
        ],
        [
            'key' => 'azure.graph.tenant',
            'value' => ''
        ],
        [
            'key'   => 'blocks.button.location',
            'value' => 'hidden',
        ],
        [
            'key'   => 'blocks.button.icon',
            'value' => 'cube',
        ],
        [
            'key'   => 'blocks.button.action',
            'value' => 'edit',
        ],
        [
            'key'   => 'core.sidebar.color_mode',
            'value' => 'user',
        ],
        [
            'key' => 'core.cms.display_link',
            'value' => 'false',
        ],
        [
            'key'   => 'core.cms.url',
            'value' => 'http://localhost',
        ],
        [
            'key'   => 'core.cms.text',
            'value' => 'Return to CMS',
        ],
        [
            'key'   => 'mail.driver',
            'value' => 'smtp',
        ],
        [
            'key'   => 'mail.smtp.from_address',
            'value' => '',
        ],
        [
            'key'   => 'mail.smtp.from_name',
            'value' => '',
        ],
        [
            'key'   => 'mail.smtp.host',
            'value' => '',
        ],
        [
            'key'   => 'mail.smtp.port',
            'value' => '587',
        ],
        [
            'key'   => 'mail.smtp.encryption',
            'value' => 'ssl',
        ],
        [
            'key'   => 'mail.smtp.username',
            'value' => '',
        ],
        [
            'key'   => 'mail.smtp.password',
            'value' => '',
        ],
    ]
];
