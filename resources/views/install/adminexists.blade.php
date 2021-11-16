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
            <div class="flex flex-col divde divide-y w-full px-4 pt-5 sm:px-24">
                <div class="flex flex-row py-4">
                    <div class="px-4 py-3 pb-8 sm:px-6">
                        <p class="text-center">An account already exists in the group Administrators, you can skip this step.</p>
                        <p class="text-center">An Administrator account would have been created if you selected Sample Data on step 2.</p>
                    </div>
                </div>               
            </div>
@endsection

@section('controls')
        <a href="{{ route('Install::final') }}"
            class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
            <span class="pt-2">Complete Installation</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </a>
@endsection
