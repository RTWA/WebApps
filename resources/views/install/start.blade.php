@extends('install.layout.master')

@section('template_title')
    Step 1 &bull; Check System Requirements
@endsection

@section('title')
    Install {{ config('installer.product.name') }}
@endsection

@section('subtitle')
    This wizard will guide you through the installation process. To begin with, check the requirements and permissions
    below.
@endsection

@section('container')
    <div class="sm:grid sm:grid-cols-2">
        <div class="flex flex-col mx-auto w-full items-center">
            <div class="px-4 pt-5 sm:px-6 w-full">
                <h3 class="text-lg text-center leading-6 font-medium text-gray-900 dark:text-blue-gray-300">
                    PHP Version and Extensions
                </h3>
            </div>
            <ul class="flex flex-col divide divide-y dark:divide-blue-gray-400 w-full px-4 sm:pr-24 sm:pl-6 mb-4">
                @foreach ($requirements['requirements'] as $type => $requirement)
                    @if ($type == 'php')
                        <li class="flex flex-row">
                            <div class="flex flex-1 py-4">
                                <div class="mr-4">
                                    <div class="font-medium">{{ strtoupper($type) }}</div>
                                </div>
                                <div class="flex-1 pt-1 text-gray-600 text-xs mr-16">(version
                                    {{ $phpSupportInfo['minimum'] }} required)</div>
                                <div
                                    class="{{ $phpSupportInfo['supported'] ? 'text-green-500' : 'text-red-500' }} font-medium">
                                    {{ $phpSupportInfo['current'] }}</div>
                            </div>
                        </li>
                    @endif
                    @foreach ($requirements['requirements'][$type] as $extension => $enabled)
                        <li class="flex flex-row">
                            <div class="flex flex-1 py-2">
                                <div class="flex-1">
                                    <div class="font-medium">{{ $extension }}</div>
                                </div>
                                <div>{!! $enabled
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-green-500 w-5 h-5">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-red-500 w-5 h-5">
                            <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd" />
                        </svg>' !!}</div>
                            </div>
                        </li>
                    @endforeach
                @endforeach
            </ul>
        </div>

        <div class="flex flex-col mx-auto w-full items-center">
            <div class="px-4 pt-5 sm:px-6 w-full">
                <h3 class="text-lg text-center leading-6 font-medium text-gray-900 dark:text-blue-gray-300">
                    File and Folder Permissions
                </h3>
            </div>
            <ul class="flex flex-col divide divide-y dark:divide-blue-gray-400 w-full px-4 sm:pr-24 sm:pl-6 mb-4">
                @foreach ($permissions['permissions'] as $permission)
                    <li class="flex flex-row">
                        <div class="flex flex-1 py-4">
                            <div class="flex-1">
                                <div class="font-medium">{{ $permission['folder'] }}</div>
                            </div>
                            <div class="flex-1 pt-1 text-gray-600 text-xs mr-16">{{ $permission['permission'] }}</div>
                            <div class="text-gray-600">{!! $permission['isSet']
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-green-500 w-5 h-5">
                                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-red-500 w-5 h-5">
                                <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd" />
                            </svg>' !!}</div>
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>

    </div>
@endsection

@section('controls')
    @if (!$phpSupportInfo['supported'] || $requirements['errors'] || $permissions['errors'])
        <div class="ml-auto flex flex-row px-2 py-2 rounded-md border border-red-500 text-red-500 font-medium">
            <span class="pt-2">Fix errors to continue</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="ml-2 w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
            </svg>
        </div>
    @else
        <a href="{{ route('Install::database') }}"
            class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
            <span class="pt-2">Setup Database</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </a>
    @endif
@endsection
