const colors = require('tailwindcss/colors');

module.exports = {
  important: true,
  content: [
    './storage/framework/views/*.php',
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './node_modules/webapps-react/dist/*.js',
  ],
  safelist: [
    { pattern: /hidden/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*flex-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*bg-/, variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus'] },
    { pattern: /.*text-/, variants: ['hover', 'focus', 'dark',  'dark:hover', 'dark:focus'] },
    { pattern: /.*border-/, variants: ['hover', 'focus', 'dark',  'dark:hover', 'dark:focus'] },
    { pattern: /.*ring-/, variants: ['hover', 'focus', 'dark',  'dark:hover', 'dark:focus'] },
    { pattern: /.*rounded-(tl|tr|br|bl)?-/ },
    { pattern: /.*fill-/ },
    { pattern: /.*m(b|t|l|r|x|y)?-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*p(b|t|l|r|x|y)?-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*h-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*w-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*justify-/ },
    { pattern: /.*top-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*right-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*bottom-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*left-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*inset-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { pattern: /.*UserAvatar/ },
    { pattern: /.*max-/ },
    { pattern: /.*opacity-/, variants: ['hover', 'focus', 'dark',  'dark:hover', 'dark:focus'] },
    { pattern: /.*grid-cols-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl']  },
    { pattern: /.*translate-/, variants: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
  ],
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // 'gray': colors.neutral,
        'light-blue': colors.sky,
        'orange': colors.amber,
      },
      zIndex: {
        '-10': '-10',
        2: 2,
        3: 3,
      },
      minHeight: {
        "screen-75": "75vh"
      },
      fontSize: {
        55: "55rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('flowbite/plugin')
  ],
}
