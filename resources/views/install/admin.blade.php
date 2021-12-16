@extends('install.layout.master')

@section('template_title')
    Step 4 &bull; Administrator Account
@endsection

@section('title')
    Create Administrator Account
@endsection

@section('subtitle')
    {{ config('installer.product.name') }} must always have at least one internal administrator account!
@endsection

@section('container')
    <form method="post" id="ADMIN_FORM" action="{{ route('Install::administrator.create') }}">
        <input type="hidden" name="_token" value="{{ csrf_token() }}" />
        <div class="flex flex-col divde divide-y dark:divide-gray-400 w-full px-4 pt-5 sm:px-12">
            <div class="flex flex-row py-4">
                <div class="px-4 pt-3 sm:px-6 w-1/3">
                    <label for="username" class="font-medium">Username</label>
                </div>
                <div class="w-2/3">
                    <input type="text" name="username" id="username"
                        class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('username') ? 'border-red-500 text-red-500' : '' }}"
                        value="{{ $fields['username'] }}" />
                    @if ($errors->has('username'))
                        <div class="text-red-500">
                            {{ $errors->first('username') }}
                        </div>
                    @endif
                </div>
            </div>
            <div class="flex flex-row py-4">
                <div class="px-4 pt-3 sm:px-6 w-1/3">
                    <label for="password" class="font-medium">Password</label>
                </div>
                <div class="w-2/3">
                    <input type="password" name="password" id="password"
                        class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('password') ? 'border-red-500 text-red-500' : '' }}"
                        value="{{ $fields['password'] }}" />
                    @if ($errors->has('password'))
                        <div class="text-red-500">
                            {{ $errors->first('password') }}
                        </div>
                    @endif
                </div>
            </div>
            <div class="flex flex-row py-4">
                <div class="px-4 pt-3 sm:px-6 w-1/3">
                    <label for="password_confirmation" class="font-medium">Confirm Password</label>
                </div>
                <div class="w-2/3">
                    <input type="password" name="password_confirmation" id="password_confirmation"
                        class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('password_confirmation') ? 'border-red-500 text-red-500' : '' }}" />
                    @if ($errors->has('password_confirmation'))
                        <div class="text-red-500">
                            {{ $errors->first('password_confirmation') }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </form>
@endsection

@section('controls')
    <a href="#" onClick="return submit();"
        class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
        <span class="pt-2">Complete Installation</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
    </a>
@endsection

@section('scripts')
    <script type="text/javascript">
        function submit() {
            document.getElementById('ADMIN_FORM').submit();
            return false;
        }
        function toggle(field) {
            var password = document.getElementById(field);
            if (password.type === 'password')
                password.type = 'text';
            else
                password.type = 'password';
        }
    </script>
@endsection