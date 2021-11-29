@extends('update.layout.master')

@section('template_title')
Step 2 &bull; Database Update
@endsection

@section('title')
Database Update
@endsection

@section('container')
<div class="flex flex-col w-full px-4 pt-5 sm:px-24">
    <div class="flex flex-row py-4 text-center">
        <div class="py-3 pb-8 text-green-500 text-center w-full">
            <p class="text-center">Database Updated!</p>
        </div>
    </div>
    <pre class="py-4 my-5"><code>{{ $outputString }}</code></pre>
</div>
@endsection

@section('controls')
<a href="{{ route('Update::complete') }}" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
    <span class="pt-2">Next</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
</a>
@endsection