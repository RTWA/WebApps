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

<body class="bg-gray-100 dark:bg-gray-900">
    <div class="h-screen w-screen">
        <div class="loader h-24 w-24 mx-auto text-gray-300 dark:text-gray-500">
            <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                <g fill="none" fill-rule="evenodd" transform="translate(1 1)" strokeWidth="2">
                    <circle cx="22" cy="22" r="6" stroke-opacity="0">
                        <animate attributeName="r" begin="1.5s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" begin="1.5s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-width" begin="1.5s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                    <circle cx="22" cy="22" r="6" stroke-opacity="0">
                        <animate attributeName="r" begin="3s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" begin="3s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-width" begin="3s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                    <circle cx="22" cy="22" r="8">
                        <animate attributeName="r" begin="0s" dur="1.5s" values="6;1;2;3;4;5;6" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                </g>
            </svg>
            <div class="sr-only">Loading</div>
        </div>
    </div>

    <script type="text/javascript">
        localStorage.clear('WA_Login');
        window.close();
    </script>
</body>

</html>