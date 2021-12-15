<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name') }}</title>
        <link rel="stylesheet" href="{{ mix( "css/app.css" ) }}">
        @foreach ($styles as $ref => $style)
            <style ref="{{ $ref }}">
                {!! $style !!}
            </style>
        @endforeach
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
    <body class="bg-transparent">
        <div class="embed">
            @php
                echo html_entity_decode($block->output)
            @endphp
            <div class="absolute bottom-0 right-0">
                <a href="/blocks/edit/{{ $block->publicId }}" target="_blank" class="text-transparent hover:bg-black hover:text-white px-2">Edit</a>
            </div>
        </div>

        <script type="text/javascript">
            {!! $block->scripts !!}
        </script>
    </body>
</html>
