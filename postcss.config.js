export default {
  plugins: {
    // Tailwind 4 moved its PostCSS plugin to its own package, and handles
    // vendor prefixing itself via Lightning CSS — autoprefixer is gone.
    '@tailwindcss/postcss': {},
  },
}
