<?php

return [
    'database' => [
        'table' => 'users',
        'column' => 'preferences',
        'primary_key' => 'id'
    ],
    'cache' => [
        'prefix' => 'User:',
        'suffix' => ':Preferences'
    ],
    'defaults' => [
        // 'Default Preferences go here
        // 'key' => 'value'
    ]
];
