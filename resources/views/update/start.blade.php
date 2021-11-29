@extends('update.layout.master')

@section('template_title')
Step 1 &bull; Login
@endsection

@section('title')
Update {{ config('installer.product.name') }}
@endsection

@section('subtitle')
This wizard will guide you through the update process.
@endsection

@section('container')
<div class="flex flex-col mx-auto w-full items-center">
    <div class="px-4 pt-5 sm:px-6 w-full">
        <h3 class="text-lg text-center leading-6 font-medium text-gray-900 dark:text-blue-gray-300">
            To begin, please login with a WebApps Administrator account.
        </h3>
        <p class="text-sm text-center text-gray-900 dark:text-blue-gray-300">You will need to use a local Administrator account to login here!</p>
    </div>

    <form method="post" id="LOGIN_FORM" action="{{ route('Update::login') }}" class="w-96">
        <input type="hidden" name="_token" value="{{ csrf_token() }}" />
        <div class="flex flex-col w-full pt-5">
            <div class="flex flex-row py-4">
                <div class="px-4 pt-3 sm:px-6 w-1/3">
                    <label for="username" class="font-medium">Username</label>
                </div>
                <div class="w-2/3">
                    <input type="text" name="username" id="username" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('username') ? 'border-red-500 text-red-500' : '' }}" value="{{ $fields['username'] }}" />
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
                    <input type="password" name="password" id="password" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 {{ $errors->has('password') ? 'border-red-500 text-red-500' : '' }}" value="{{ $fields['password'] }}" />
                    @if ($errors->has('password'))
                    <div class="text-red-500">
                        {{ $errors->first('password') }}
                    </div>
                    @endif
                </div>
            </div>
            <div class="flex flex-row pt-4">
                <div class="px-4 sm:px-6 w-20 text-center">
                    <input type="checkbox" id="backup_confirm" name="backup_confirm" class="rounded {{ $errors->has('backup_confirm') ? 'border-red-500' : '' }}" @if ($fields['backup_confirm']==='on' ) checked @endif />
                </div>
                <div class="w-full">
                    <label for="backup_confirm">I have taken a backup of my database</label>
                </div>
            </div>
            <div class="flex flex-row pb-4 w-full">
                @if ($errors->has('backup_confirm'))
                <div class="text-sm text-red-500">
                    {{ $errors->first('backup_confirm') }}
                </div>
                @endif
            </div>
        </div>
    </form>
</div>
@endsection

@section('controls')
<a href="#" onClick="return submit();" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
    <span class="pt-2">Login</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
</a>
@endsection

@section('scripts')
<script type="text/javascript">
    function submit() {
        document.getElementById('LOGIN_FORM').submit();
        return false;
    }
</script>
@endsection