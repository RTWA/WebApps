<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('template_title') | {{ config('installer.product.name') }} Setup</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    @yield('style')
    @include('utils.darkmode')
    @include('utils.branding')
    <script>
        window.Laravel = <?php echo json_encode([
                                'csrfToken' => csrf_token(),
                            ]); ?>
    </script>
    @livewireStyles
</head>

<body class="py-6 px-24 text-gray-700 bg-gray-200 dark:bg-gray-900 dark:text-white">

    @include('install.layout.steps')
    
    @yield('container')

    @if (session()->has('errors'))
    <div class="text-red-500" id="error_alert">
        <button type="button" class="close" id="close_alert" data-dismiss="alert" aria-hidden="true">
            <i class="fa fa-close" aria-hidden="true"></i>
        </button>
        <h4>
            <i class="fa fa-fw fa-exclamation-triangle" aria-hidden="true"></i>
            {{ trans('installer_messages.forms.errorTitle') }}
        </h4>
        <ul>
            @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <p class="text-center text-gray-500 mt-4">{{ config('installer.product.name') }} - Version
        {{ config('installer.product.version') }}
    </p>

    <script src="{{ mix('js/manifest.js') }}"></script>
    <script src="{{ mix('js/vendor.js') }}"></script>
    <script src="{{ mix('js/app.js') }}"></script>
    @yield('scripts')
    @livewireScripts
</body>

</html>