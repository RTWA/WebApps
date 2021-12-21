const colors = require('tailwindcss/colors');

module.exports = {
  important: true,
  purge: {
    content: [
      './storage/framework/views/*.php',
      './resources/**/*.blade.php',
      './resources/**/*.js',
      './node_modules/webapps-react/dist/*.js'
    ],
    options: {
      safelist: [
        /.*flex-/,
        /.*bg-/,
        /.*text-/,
        /.*border-/,
        /.*m(b|t|l|r|x|y)?-/,
        /.*p(b|t|l|r|x|y)?-/,
        /.*h-/,
        /.*w-/,
        /.*top-/,
        /.*right-/,
        /.*bottom-/,
        /.*left-/,
        /.*UserAvatar/,
        /.*max-/,
        /.*opacity-/,
        /.*grid-cols-/,
        /.*translate-/,
      ]
    }
  },
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'gray': colors.trueGray,
        'light-blue': colors.sky,
        'orange': colors.orange,
        'lime': colors.lime,
        'fuchsia': colors.fuchsia
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
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"],
      inset: ["checked"],
      fontWeight: ["hover"],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
}
