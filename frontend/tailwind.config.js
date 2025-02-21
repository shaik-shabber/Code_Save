/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode via a "dark" class on the root element
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightThemeBackground: "#f7fafc",
        darkThemeBackground: "#1a202c",
      },
    },
  },
  plugins: [],
};
