/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        heading: ["Merriweather", "serif"],
        alt: ["Poppins", "sans-serif"],
        mono: ["Source Code Pro", "monospace"],
      },
    },
  },
  plugins: [],
};