@extends('update.layout.master')

@section('template_title')
Step 3 &bull; Updated
@endsection

@section('title')
Updated {{ config('installer.product.name') }}
@endsection

@section('container')

<div class="flex flex-col w-full px-4 pt-5 sm:px-24">
    <div class="flex flex-row py-4 text-center">
        <div class="py-3 pb-8 text-green-500 text-center w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-64 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-center">Update Completed!</p>
        </div>
    </div>
</div>
@endsection

@section('controls')
<a href="{{ url('/') }}" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
    <span class="pt-2">Return to {{ config('installer.product.name') }}</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
</a>
@endsection