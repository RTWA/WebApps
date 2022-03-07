<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name') }}</title>
        <link rel="stylesheet" href="{{ mix( "css/app.css" ) }}">
        @foreach ($styles as $ref => $style)
            <style ref="{{ $ref }}">
                {!! $style !!}
            </style>
        @endforeach
        @include('utils.darkmode')
        @include('utils.branding')
    </head>
    <body class="bg-transparent dark:bg-gray-900 dark:text-white">
        <div class="embed">
            @php
                echo html_entity_decode($block->output)
            @endphp
            <div class="absolute {{ $button['location'] }}">
                @if ($button['action'] === 'edit')
                <a href="/blocks/edit/{{ $block->publicId }}" target="_blank" class="flex text-gray-400 hover:bg-gray-400 hover:text-white p-1">    
                @elseif ($button['action'] === 'popup')
                <a href="#" target="_blank" class="flex text-gray-400 hover:bg-gray-400 hover:text-white p-1" onclick="openPopover(event)">
                @endif                
                    @if ($button['icon'] === 'cube')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    @elseif ($button['icon'] === 'cog')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    @elseif ($button['icon'] === 'dots')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    @elseif ($button['icon'] === 'dotsAlt')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    @elseif ($button['icon'] === 'link')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    @elseif ($button['icon'] === 'info')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    @elseif ($button['icon'] === 'edit')
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    @endif
                </a>
            </div>

            @if ($button['action'] === 'popup')
            <div class="hidden bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 z-50 font-normal leading-normal text-xs max-w-xs text-left break-words rounded-lg" id="popover">
                <div class="bg-gray-200 dark:bg-gray-700 opacity-75 font-semibold p-3 mb-0 border-b border-solid border-gray-200 dark:border-gray-600 uppercase rounded-t-lg">
                    WebApps Block
                </div>
                <div class="p-3">
                    This Block is created with WebApps. If you are the owner of this Block, you can edit it by clicking <a href="/blocks/edit/{{ $block->publicId }}" target="_blank" class="hover:underline cursor-pointer">here</a>.
                </div>
            </div>
            @endif
        </div>

        <script type="text/javascript">
            {!! $block->scripts !!}
        </script>

        @if ($button['action'] === 'popup')
        <script src="https://unpkg.com/@popperjs/core@2.9.1/dist/umd/popper.min.js" charset="utf-8"></script>
        <script>
            function openPopover(event){
                event.preventDefault();
                let element = event.currentTarget;
                var popper = Popper.createPopper(element, document.getElementById('popover'), { placement: 'auto' });
                document.getElementById('popover').classList.toggle("hidden");
            }
        </script>
        @endif
    </body>
</html>
