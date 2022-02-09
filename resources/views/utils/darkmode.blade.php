<script type="text/javascript" async>
    var dark_theme = '{!! RobTrehy\LaravelApplicationSettings\ApplicationSettings::get('core.ui.dark_mode', 'user') !!}';
    if ((dark_theme === 'user' && (localStorage['WA_DarkMode'] === 'dark' || (!('WA_DarkMode' in localStorage) &&
            window.matchMedia('(prefers-color-scheme: dark)').matches))) ||
        dark_theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
</script>