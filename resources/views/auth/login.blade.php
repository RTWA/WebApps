<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name') }}</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    @include('utils.darkmode')
    @include('utils.branding')
</head>

<body class="auth-bg" data-theme="{{ ApplicationSettings::get('core.ui.theme') }}">

    <div class="min-h-screen flex flex-col items-center justify-center w-96">
        <div
            class="flex flex-col shadow bg-white dark:bg-gray-800 rounded px-4 sm:px-6 md:px-8 lg:px-10 py-8 w-full max-w-md">
            <div class="flex flex-none items-center justify-center text-gray-600 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    class="h-14 text-{{ ApplicationSettings::get('core.ui.theme') }}-600 dark:text-{{ ApplicationSettings::get('core.ui.theme') }}-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span class="ml-4 text-4xl font-bold">
                    {{ config('app.name') }}
                </span>
            </div>
            @if ($azure)
                <a href={{URL::to('/login/oauth2/azure')}}
                    class="relative mt-6 border rounded pl-10 py-2 text-sm text-gray-800 bg-gray-100 hover:bg-gray-200 dark:border-gray-100 dark:bg-gray-700 dark:hover:bg-gray-900 dark:text-gray-100">
                    <span class="absolute left-0 top-0 flex items-center justify-center h-full w-10">
                        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft"
                            class="w-5 h-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path fill="currentColor"
                                d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z">
                            </path>
                        </svg>
                    </span>
                    Continue with Microsoft 365
                </a>
                <div class="relative mt-10 h-px bg-gray-300 dark:bg-gray-600">
                    <div class="absolute left-0 top-0 flex justify-center w-full -mt-2">
                        <span class="bg-white dark:bg-gray-800 px-4 text-xs text-gray-500 uppercase">or</span>
                    </div>
                </div>
            @endif

            <div class="mt-10 min-h-[192px]" id="WebApps"></div>

            @if ($registration == 'true')
                <div class="flex justify-center items-center mt-6">
                    <a href="{{ route('register') }}"
                        class="inline-flex items-center font-bold text-{{ ApplicationSettings::get('core.ui.theme') }}-600 hover:text-{{ ApplicationSettings::get('core.ui.theme') }}-700 dark:text-{{ ApplicationSettings::get('core.ui.theme') }}-500 dark:hover:text-{{ ApplicationSettings::get('core.ui.theme') }}-600 text-xs text-center">
                        <span>
                            <svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </span>
                        <span class="ml-2">No account? Register here!</span>
                    </a>
                </div>
            @endif
        </div>
    </div>


    <script src="{{ mix('js/manifest.js') }}"></script>
    <script src="{{ mix('js/vendor.js') }}"></script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>

</html>
