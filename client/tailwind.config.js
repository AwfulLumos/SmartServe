/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4a6741",
          dark: "#3a5333",
          light: "#5d8152",
          panel: "#3d5933",
        },
      },
    },
  },
  plugins: [],
};
