/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#EC4899',       // Pink color for period theme
        secondary: '#8B5CF6',     // Purple accent
        background: '#FDF2F8',    // Light pink background
        text: '#1F2937',          // Dark gray text
        lightText: '#6B7280',     // Light gray text
      }
    },
  },
  plugins: [],
}