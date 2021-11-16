<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name') }}</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <script type="text/javascript" async>
        var dark_theme = '{!! RobTrehy\LaravelApplicationSettings\ApplicationSettings::get('core.ui.dark_mode', '') !!}';
        if ((dark_theme === 'user' && (localStorage['WA_DarkMode'] === 'dark' || (!('WA_DarkMode' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches))) ||
            dark_theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    </script>
</head>

<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="WebApps" class="app"></div>

    <script src="{{ mix('js/manifest.js') }}"></script>
    <script src="{{ mix('js/vendor.js') }}"></script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>

</html>
