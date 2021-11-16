@inject('installer', 'App\Http\Controllers\Install\InstallController')
<div class="grid grid-cols-5">

    {{-- Step 1: Check System Requirements --}}
    {!! $installer::getRouteTab([
        'step' => '1',
        'title' => 'Check System Requirements',
        'icon' => '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>'
    ],
    'Install::start',
    ['Install::application', 'Install::application.save', 'Install::database', 'Install::database.save', 'Install::database.created', 'Install::administrator', 'Install::administrator.create', 'Install::final'])
    !!}

    {{-- Step 2: Database Setup --}}
    {!! $installer::getRouteTab([
        'step' => '2',
        'title' => 'Database Setup',
        'icon' => '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>'
    ],
    ['Install::database', 'Install::database.save', 'Install::database.created'], 
    ['Install::application', 'Install::application.save', 'Install::administrator', 'Install::administrator.create', 'Install::final'])
    !!}

    {{-- Step 3: Application Setup --}}
    {!! $installer::getRouteTab([
        'step' => '3',
        'title' => 'WebApps Setup',
        'icon' => '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>'
    ],
    ['Install::application', 'Install::application.save'],
    ['Install::administrator', 'Install::administrator.create', 'Install::final'])
    !!}

    {{-- Step 4: Administrator Account --}}
    {!! $installer::getRouteTab([
        'step' => '4',
        'title' => 'Administrator Account',
        'icon' => '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>'
    ],
    ['Install::administrator', 'Install::administrator.create'],
    ['Install::final'])
    !!}

    {{-- Step 5: Completed --}}
    {!! $installer::getRouteTab([
        'step' => '5',
        'title' => 'Setup Complete!',
        'icon' => '<svg class="w-full" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>'
    ],
    'Install::final', 
    [])
    !!}
</div>