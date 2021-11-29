@extends('update.layout.master')

@section('template_title')
Step 2 &bull; Database Update
@endsection

@section('title')
Database Update
@endsection

@section('container')
<div class="flex flex-col mx-auto w-full items-center">
    <div class="px-4 pt-5 sm:px-6 w-full">
        <h3 class="text-lg text-center leading-6 font-medium text-gray-900 dark:text-blue-gray-300">
            There are {{ $updates }} database updates required for this WebApps update to complete.
        </h3>
        @if ($updates === 0)
        <p class="my-8 text-sm text-center text-gray-900 dark:text-blue-gray-300">Click Next to proceed through the update process.</p>
        @else
        <p class="my-8 text-sm text-center text-gray-900 dark:text-blue-gray-300">Click Next to install the updates.</p>
        @endif
    </div>
</div>
@endsection

@section('controls')
<a href="{{ route('Update::database.update') }}" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
    <span class="pt-2">Next</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
</a>
@endsection