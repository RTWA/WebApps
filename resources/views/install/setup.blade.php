@extends('install.layout.master')

@section('template_title')
Step 3 &bull; {{ config('installer.product.name') }} Setup
@endsection

@section('title')
Setup {{ config('installer.product.name') }}
@endsection

@section('subtitle')
Lets set some basic {{ config('installer.product.name') }} Settings
@endsection

@section('container')
<form method="post" id="SETUP_FORM" action="{{ route('Install::application.save') }}">
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
    <div class="flex flex-col divde divide-y dark:divide-blue-gray-400 w-full px-4 pt-5 sm:px-12">
        <div class="flex flex-row py-4">
            <div class="px-4 pt-3 sm:px-6 w-1/3">
                <label for="APP_URL" class="font-medium">{{ config('installer.product.name') }} URL</label>
            </div>
            <div class="w-2/3">
                <input type="text" name="APP_URL" id="APP_URL" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('APP_URL') ? 'border-red-500 text-red-500' : '' }}" value="{{ $fields['APP_URL'] }}" />
                @if ($errors->has('APP_URL'))
                <div class="text-red-500">
                    {{ $errors->first('APP_URL') }}
                </div>
                @endif
            </div>
        </div>
        <div class="flex flex-row py-4">
            <div class="px-4 pt-3 sm:px-6 w-1/3">
                <label for="theme" class="font-medium">Theme Colour</label>
            </div>
            <div class="w-2/3">
                <div class="grid grid-cols-8 gap-4">
                    <div data-color="indigo" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-indigo-600 dark:bg-indigo-500 not-sr-only"></div>
                        <div class="text-center">Indigo</div>
                    </div>
                    <div data-color="fuchsia" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-fuchsia-600 dark:bg-fuchsia-500 not-sr-only"></div>
                        <div class="text-center">Fuchsia</div>
                    </div>
                    <div data-color="light-blue" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-light-blue-600 dark:bg-light-blue-500 not-sr-only"></div>
                        <div class="text-center">Blue</div>
                    </div>
                    <div data-color="red" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-red-600 dark:bg-red-500 not-sr-only"></div>
                        <div class="text-center">Red</div>
                    </div>
                    <div data-color="orange" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-orange-600 dark:bg-orange-500 not-sr-only"></div>
                        <div class="text-center">Orange</div>
                    </div>
                    <div data-color="yellow" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-yellow-600 dark:bg-yellow-500 not-sr-only"></div>
                        <div class="text-center">Yellow</div>
                    </div>
                    <div data-color="lime" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-lime-600 dark:bg-lime-500 not-sr-only"></div>
                        <div class="text-center">Green</div>
                    </div>
                    <div data-color="gray" class="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-gray-600 dark:bg-gray-500 not-sr-only"></div>
                        <div class="text-center">Gray</div>
                    </div>
                </div>
                <input type="hidden" name="theme" id="theme" value="{{ $fields['theme'] }}" />
            </div>
        </div>

        <div class="flex flex-row py-4">
            <div class="px-4 pt-3 sm:px-6 w-1/3">
                <label for="dark_mode" class="font-medium">Dark Mode Option</label>
            </div>
            <div class="w-2/3">
                <div class="grid grid-cols-5 gap-4">
                    <div data-mode="light" class="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-gray-200 not-sr-only"></div>
                        <div class="text-center">Light Mode Only</div>
                    </div>
                    <div data-mode="dark" class="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="selector h-10 bg-gray-900 not-sr-only"></div>
                        <div class="text-center">Dark Mode Only</div>
                    </div>
                    <div data-mode="user" class="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                        <div class="flex flex-row w-full h-10">
                            <div class="selector h-10 w-full bg-gray-200 not-sr-only"></div>
                            <div class="selector h-10 w-full bg-gray-900 not-sr-only"></div>
                        </div>
                        <div class="text-center">User Selectable</div>
                    </div>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                    If you choose to allow the user to select, their system preferences will be respected.
                </p>
                <input type="hidden" name="dark_mode" id="dark_mode" value="{{ $fields['dark_mode'] }}" />
            </div>
        </div>

        <div class="flex flex-row py-4">
            <div class="px-4 pt-3 sm:px-6 w-1/3">
                <label for="error_reporting" class="font-medium">Enable Error Reporting</label>
            </div>
            <div class="w-2/3">
                <div class="grid grid-cols-5 gap-4">
                    <div class="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="error_reporting" name="error_reporting" checked="{{ $fields['error_reporting'] }}" class="checked:bg-gray-500 outline-none focus:ring-0 focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label for="error_reporting" class="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer" />
                    </div>
                </div>
                <p class="text-xs text-gray-400">
                    Enabling this option will report all application errors to WebApps via Sentry. (<a href="https://docs.getwebapps.uk/configuration/application-settings" target="_blank" class="text-gray-500 hover:text-gray-600 font-semibold">See Documentation</a>)
                </p>
            </div>
        </div>
    </div>
</form>
@endsection

@section('controls')
<a href="#" onClick="return submit();" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
    <span class="pt-2">Create Administrator</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
</a>
@endsection

@section('scripts')
<script type="text/javascript">
    function submit() {
        document.getElementById('SETUP_FORM').submit();
        return false;
    }
</script>
@endsection