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
    <div class="h-screen w-screen" id="loader">
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
            <p id="info" class="hidden text-lg text-center -mx-48">If you do not see a login window, please disable any pop-up blockers.</p>
        </div>
    </div>

    <div class="text-gray-700 dark:text-gray-100 bg-gray-200 dark:bg-gray-900 h-screen w-screen hidden" id="notauthed">
        <div class="h-full w-full flex flex-wrap justify-center content-end md:content-center items-end md:items-center">
            <div class="p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-48 w-48 mx-auto text-red-500 dark:text-red-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-xl lg:text-3xl font-bold">Sorry, something went wrong on this page.</h2>
                <p class="my-4">You could not be authenticated. Please reload the page to try again.</p>
                <p class="text-sm lg:text-base text-gray-900 dark:text-gray-300">Alternatively <a href="#" id="newTab" target="blank" class="underline">click here</a> to try the content in a new window.</p>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        // Set the redirect URL
        localStorage.setItem('WA_Login', `${window.location.origin}/login/windowed/callback`);

        // Open login in popup
        signinWin = window.open("{!!URL::to('/login')!!}", "{{ config('app.name') }}", "width=394,height=498,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + 500 + ",top=" + 200);

        // Reveal info
        setTimeout(function() {
            document.getElementById('info').classList.remove('hidden');
        }, 2000);

        // Monitor for close of popup
        var timer = setInterval(async function() {
            if (signinWin.closed) {
                clearInterval(timer);

                var config = {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }

                var csrfToken = getCookie('XSRF-TOKEN');
                if (csrfToken !== undefined) {
                    config.headers['X-XSRF-TOKEN'] = csrfToken.replace('%3D', '=');
                }
                var url = `${window.location.origin.replace(/\/$/, "")}/api/user`;

                let res = await fetch(url, config)
                let response = await res.json();

                if (response.message !== 'Unauthenticated.') {
                    const urlParams = new URLSearchParams(window.location.search);
                    window.location.href = urlParams.get('url');
                } else {
                    // Set the newTab URL
                    const urlParams = new URLSearchParams(window.location.search);
                    document.getElementById('newTab').href = urlParams.get('url');
                    // Reveal message
                    document.getElementById('loader').classList.add('hidden');
                    document.getElementById('notauthed').classList.remove('hidden');
                }
            }
        }, 1000);

        function getCookie(name) {
            const value = `; ${document?.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }
    </script>
</body>

</html>