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
        <div class="flex flex-col shadow bg-white dark:bg-gray-800 rounded px-4 sm:px-6 md:px-8 lg:px-10 py-8 w-full max-w-md">
            <div class="flex flex-none items-center justify-center text-gray-600 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-14 text-{{ ApplicationSettings::get('core.ui.theme') }}-600 dark:text-{{ ApplicationSettings::get('core.ui.theme') }}-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span class="ml-4 text-4xl font-bold">
                    {{ config('app.name') }}
                </span>
            </div>

            <form method="POST" action="{{ route('registerPost') }}" class="mt-10">
                @csrf

                <div class="flex flex-col mb-6">
                    <label htmlFor="name" class="sr-only">Your Name:</label>
                    <input id="name" type="text" name="name" class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-{{ ApplicationSettings::get('core.ui.theme') }}-400 @error('name') border-red-500 text-red-500 @enderror" placeholder="Your Name" autoComplete="no" value="{{ old('name') }}" />
                    @error('name')
                    <div class=" text-sm text-red-500">{{ $message }}
                    </div>
                    @enderror
                </div>

                <div class="flex flex-col mb-6">
                    <label htmlFor="email" class="sr-only">E-Mail Address:</label>
                    <input id="email" type="email" name="email" class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-{{ ApplicationSettings::get('core.ui.theme') }}-400 @error('email') border-red-500 text-red-500 @enderror" placeholder="E-mail Address" autoComplete="no" value="{{ old('email') }}" />
                    @error('email')
                    <div class=" text-sm text-red-500">{{ $message }}
                    </div>
                    @enderror
                </div>

                <div class="flex flex-col mb-6">
                    <label htmlFor="username" class="sr-only">Username:</label>
                    <input id="username" type="text" name="username" class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-{{ ApplicationSettings::get('core.ui.theme') }}-400 @error('username') border-red-500 text-red-500 @enderror" placeholder="Username" autoComplete="no" value="{{ old('username') }}" />
                    @error('username')
                    <div class="text-sm text-red-500">{{ $message }}</div>
                    @enderror
                </div>

                <div class="flex flex-col mb-6">
                    <label htmlFor="password" class="sr-only">Password:</label>
                    <input id="password" type="password" name="password" class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-{{ ApplicationSettings::get('core.ui.theme') }}-400 @error('password') border-red-500 text-red-500 @enderror" placeholder="Password" autoComplete="no" />
                    @error('password')
                    <div class="text-sm text-red-500">{{ $message }}</div>
                    @enderror
                </div>

                <div class="flex flex-col mb-6">
                    <label htmlFor="password_confirmation" class="sr-only">Confirm Password:</label>
                    <input id="password_confirmation" type="password" name="password_confirmation" class="text-sm sm:text-base placeholder-gray-500 px-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-{{ ApplicationSettings::get('core.ui.theme') }}-400 @error('password_confirmation') border-red-500 text-red-500 @enderror" placeholder="Confirm Password" autoComplete="no" />
                    @error('password_confirmation')
                    <div class="text-sm text-red-500">{{ $message }}</div>
                    @enderror
                </div>

                <div class="flex w-full">
                    <button id="register-button" type="submit" class="flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-{{ ApplicationSettings::get('core.ui.theme') }}-600 dark:bg-{{ ApplicationSettings::get('core.ui.theme') }}-500 hover:bg-{{ ApplicationSettings::get('core.ui.theme') }}-700 dark:hover:bg-{{ ApplicationSettings::get('core.ui.theme') }}-600 rounded py-2 w-full transition duration-150 ease-in">
                        <span class="mr-2 uppercase">Register</span>
                        <span>
                            <svg class="h-6 w-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </button>
                </div>

            </form>

            <div class="flex justify-center items-center mt-6">
                <a href="{{ route('login') }}" class="inline-flex items-center font-bold text-{{ ApplicationSettings::get('core.ui.theme') }}-600 hover:text-{{ ApplicationSettings::get('core.ui.theme') }}-700 dark:text-{{ ApplicationSettings::get('core.ui.theme') }}-500 dark:hover:text-{{ ApplicationSettings::get('core.ui.theme') }}-600 text-xs text-center">
                    <span>
                        <svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </span>
                    <span class="ml-2">Already have an account? Login here!</span>
                </a>
            </div>
        </div>
    </div>


    <script src="{{ mix('js/manifest.js') }}"></script>
    <script src="{{ mix('js/vendor.js') }}"></script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>

</html>