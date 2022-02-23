const colors = require('tailwindcss/colors');

module.exports = {
  important: true,
  content: [
    './storage/framework/views/*.php',
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './node_modules/webapps-react/dist/*.js'
  ],
  safelist: [
    { pattern: /.*flex-/ },
    { pattern: /.*bg-/ },
    { pattern: /.*text-/ },
    { pattern: /.*border-/ },
    { pattern: /.*m(b|t|l|r|x|y)?-/ },
    { pattern: /.*p(b|t|l|r|x|y)?-/ },
    { pattern: /.*h-/ },
    { pattern: /.*w-/ },
    { pattern: /.*top-/ },
    { pattern: /.*right-/ },
    { pattern: /.*bottom-/ },
    { pattern: /.*left-/ },
    { pattern: /.*UserAvatar/ },
    { pattern: /.*max-/ },
    { pattern: /.*opacity-/ },
    { pattern: /.*grid-cols-/ },
    { pattern: /.*translate-/ },
  ],
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'gray': colors.neutral,
        'light-blue': colors.sky,
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
    require('flowbite/plugin')
  ],
}
