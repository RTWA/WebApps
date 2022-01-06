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
    <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js"
        integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
    @include('utils.darkmode')
    @include('utils.branding')
    <script>
        window.Laravel = <?php echo json_encode([
            'csrfToken' => csrf_token(),
        ]); ?>
    </script>
</head>

<body class="py-6 px-24 text-gray-700 bg-gray-200 dark:bg-gray-900 dark:text-white">

    @include('install.layout.steps')

    <div class="relative flex flex-col min-w-0 break-words mb-6 mt-12 mx-24 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 overflow-hidden">
        <div class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-6 py-6 cursor-pointer">
            <h3 class="text-2xl leading-6 font-medium text-indigo-600 dark:text-indigo-400">@yield('title')</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
                @yield('subtitle')
            </p>
        </div>
        <div class="flex-auto px-4 lg:px-10 overflow-hidden">
            @yield('container')
        </div>

        <div class="flex p-2 border-t border-gray-200 dark:border-gray-500">
            @if (session('message'))
                <p class="text-blue-500 text-center text-xs w-2/3">
                    <strong>
                        @if (is_array(session('message')))
                            {{ session('message')['message'] }}
                        @else
                            {{ session('message') }}
                        @endif
                    </strong>
                </p>
            @endif

            @yield('controls')
        </div>
    </div>

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
        {{ config('installer.product.version') }}</p>

    <script src="{{ mix('js/manifest.js') }}"></script>
    <script src="{{ mix('js/vendor.js') }}"></script>
    <script src="{{ mix('js/app.js') }}"></script>
    @yield('scripts')
    <script type="text/javascript">
        const colors = [{
                class: 'indigo',
                name: 'Indigo'
            },
            {
                class: 'fuchsia',
                name: 'Fuchsia'
            },
            {
                class: 'light-blue',
                name: 'Blue'
            },
            {
                class: 'red',
                name: 'Red'
            },
            {
                class: 'orange',
                name: 'Orange'
            },
            {
                class: 'yellow',
                name: 'Yellow'
            },
            {
                class: 'lime',
                name: 'Green'
            },
            {
                class: 'gray',
                name: 'Gray'
            }
        ];

        function setTheme(newColor) {
            Object(colors).map(function(color) {
                if (color !== newColor) {
                    $(`.bg-${color.class}-600:not(.selector)`).removeClass(`bg-${color.class}-600`).addClass(
                        `bg-${newColor}-600`);
                    $(`.dark\\:bg-${color.class}-400`).removeClass(`dark:bg-${color.class}-400`).addClass(
                        `dark:bg-${newColor}-400`);
                    $(`.hover\\:bg-${color.class}-600`).removeClass(`hover:bg-${color.class}-600`).addClass(
                        `hover:bg-${newColor}-600`);
                    $(`.dark\\:hover\\:bg-${color.class}-400`).removeClass(`dark:hover:bg-${color.class}-400`).addClass(
                        `dark:hover:bg-${newColor}-400`);
                    $(`.checked\\:bg-${color.class}-600:not(.selector)`).removeClass(`checked:bg-${color.class}-600`).addClass(
                        `checked:bg-${newColor}-600`);
                    $(`.dark\\:checked\\:bg-${color.class}-400:not(.selector)`).removeClass(`dark:checked:bg-${color.class}-400`).addClass(
                        `dark:checked:bg-${newColor}-400`);

                    $(`.border-${color.class}-600`).removeClass(`border-${color.class}-600`).addClass(
                        `border-${newColor}-600`);
                    $(`.dark\\:border-${color.class}-400`).removeClass(`dark:border-${color.class}-400`).addClass(
                        `dark:border-${newColor}-400`);

                    $(`.text-${color.class}-600`).removeClass(`text-${color.class}-600`).addClass(
                        `text-${newColor}-600`);
                    $(`.dark\\:text-${color.class}-400`).removeClass(`dark:text-${color.class}-400`).addClass(
                        `dark:text-${newColor}-400`);

                    $(`.focus\\:ring-${color.class}-600`).removeClass(`focus:ring-${color.class}-600`).addClass(
                        `focus:ring-${newColor}-600`);
                    $(`.dark\\:focus\\:ring-${color.class}-400`).removeClass(`dark:focus:ring-${color.class}-400`).addClass(
                        `dark:focus:ring-${newColor}-400`);
                }
            });
            localStorage['WA_SetupTheme'] = newColor;
            $('#theme').val(newColor);
        }

        $(document).ready(function() {
            if (localStorage['WA_SetupTheme'] !== null && localStorage['WA_SetupTheme'] !== undefined) {
                setTheme(localStorage['WA_SetupTheme']);
            }

            $('.theme').on("click", function() {
                setTheme($(this).attr('data-color'));
            });

            $('.dark_mode').on("click", function() {
                if ($(this).attr('data-mode') === "user") {
                    // User selectable
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                    }
                    localStorage['WA_DarkMode'] = null;
                } else if ($(this).attr('data-mode') === "dark") {
                    // Dark Mode Only
                    document.documentElement.classList.add('dark');
                    localStorage['WA_DarkMode'] = 'dark';
                } else {
                    // Light Mode Only
                    document.documentElement.classList.remove('dark');
                    localStorage['WA_DarkMode'] = 'light';
                }
                $('#dark_mode').val($(this).attr('data-mode'))
            });
        });
    </script>
</body>

</html>
