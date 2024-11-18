/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'text-purple-500',
    'text-purple-400',
    'hover:text-purple-400',
    'hover:text-purple-300'
  ],
};
