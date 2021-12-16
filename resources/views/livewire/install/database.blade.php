<div class="relative flex flex-col min-w-0 break-words mb-6 mt-12 mx-24 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 overflow-hidden">
    <div class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-6 py-6 cursor-pointer">
        <h3 class="text-2xl leading-6 font-medium text-indigo-600 dark:text-indigo-400">Database Setup</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Complete the form with the details for the database you have already created
        </p>
    </div>
    <div class="flex-auto px-4 lg:px-10 overflow-hidden">
        @if ($show === 'form')
        <form id="DB_FORM" wire:submit.prevent="submitForm">
            @csrf
            <div class="flex flex-col divde divide-y dark:divide-gray-400 w-full px-4 pt-5 sm:px-12">
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_CONNECTION" class="font-medium">Database Type</label>
                    </div>
                    <div class="w-2/3">
                        <select name="DB_CONNECTION" id="DB_CONNECTION" wire:model="DB_CONNECTION" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_CONNECTION') border-red-500 text-red-500 @enderror">
                            <option value="mysql">MySQL</option>
                            <option value="sqlite">SQLite</option>
                            <option value="pgsql">PostgreSQL</option>
                            <option value="sqlsrv">Microsoft SQL Server</option>
                        </select>
                        @error('DB_CONNECTION')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_HOST" class="font-medium">Server Name</label>
                    </div>
                    <div class="w-2/3">
                        <input type="text" name="DB_HOST" id="DB_HOST" wire:model="DB_HOST" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_HOST') border-red-500 text-red-500 @enderror" />
                        @error('DB_HOST')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_PORT" class="font-medium">Server Port</label>
                    </div>
                    <div class="w-2/3">
                        <input type="text" name="DB_PORT" id="DB_PORT" wire:model="DB_PORT" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_PORT') border-red-500 text-red-500 @enderror" />
                        @error('DB_PORT')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_DATABASE" class="font-medium">Database Name</label>
                    </div>
                    <div class="w-2/3">
                        <input type="text" name="DB_DATABASE" id="DB_DATABASE" wire:model="DB_DATABASE" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_DATABASE') border-red-500 text-red-500 @enderror" />
                        @error('DB_DATABASE')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_USERNAME" class="font-medium">Username</label>
                    </div>
                    <div class="w-2/3">
                        <input type="text" name="DB_USERNAME" id="DB_USERNAME" wire:model="DB_USERNAME" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_USERNAME') border-red-500 text-red-500 @enderror" />
                        @error('DB_USERNAME')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="flex flex-row py-4">
                    <div class="px-4 pt-3 sm:px-6 w-1/3">
                        <label for="DB_PASSWORD" class="font-medium">Password</label>
                    </div>
                    <div class="w-2/3">
                        <input type="password" name="DB_PASSWORD" id="DB_PASSWORD" wire:model="DB_PASSWORD" class="install-input-field focus:ring-indigo-600 dark:focus:ring-indigo-400 @error('DB_PASSWORD') border-red-500 text-red-500 @enderror" />
                        @error('DB_PASSWORD')
                        <div class="text-red-500">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
            </div>
        </form>
        @elseif ($show === 'output')
        <div wire:poll.500ms>
            <p class="pt-5 text-lg {{ ($status === 'success') ? 'text-green-500' : 'text-red-500' }}">{{ $outputTitle }}</p>
            <pre class="p-4 m-5"><code>{{ $outputString }}</code></pre>
            @if ($showSampleDataButton)
            <button wire:click.prevent="installSampleData" class="-ml-5 mb-5 flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
                Install Sample Data
            </button>
            @endif
            @if ($complete)
            <p class="mb-5 text-lg text-green-500">Database Setup Complete!</p>
            @endif
        </div>
        @endif
    </div>

    <div class="flex p-2 border-t border-gray-200 dark:border-gray-500">
        @if (session('message'))
        <p class="text-blue-500 text-center text-xs w-2/3">
            <strong>
                @if (is_array(session('message')))
                {{ session('message')['message'] }}
                @else
                {{ session('message') }}
                @endif
            </strong>
        </p>
        @endif

        @if ($show === 'form')
        <button wire:loading.attr="disabled" type="submit" form="DB_FORM" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
            <span class="pt-2">Create Tables</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
        @elseif ($show === 'output' && $showSampleDataButton)
        <a href="{{ route('Install::application') }}" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
            <span class="pt-2">Continue without Sample Data</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </a>
        @elseif ($show === 'output' && $complete)
        <a href="{{ route('Install::application') }}" class="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
            <span class="pt-2">Continue</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </a>
        @endif
    </div>
</div>