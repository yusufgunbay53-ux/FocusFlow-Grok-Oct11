/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: '#00d2ff',
        night: '#0b111e',
      },
    },
  },
  plugins: [],
}
