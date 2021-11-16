const mix = require('laravel-mix');
// require('laravel-mix-auto-extract');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */


mix.js('resources/js/widgets/BlockCount.js', 'public/js/widgets/BlockCount.js');
mix.js('resources/js/widgets/BlockViews.js', 'public/js/widgets/BlockViews.js');
mix.js('resources/js/widgets/RecentBlocks.js', 'public/js/widgets/RecentBlocks.js');
mix.js('resources/js/widgets/PopularBlocks.js', 'public/js/widgets/PopularBlocks.js');

mix
    .setPublicPath('public')
    .setResourceRoot('../')
    .js('resources/js/app.js', 'public/js/app.js').react()
    .postCss('resources/css/app.css', 'public/css', [
        require('tailwindcss'),
    ])
    .version()
    .extract();
