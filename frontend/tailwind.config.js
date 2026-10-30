/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        afry: {
          black: '#0A0A0A',
          red: '#E31E24',
          white: '#FFFFFF',
          light: '#F5F5F5',
          grey: '#9CA3AF',
          success: '#1E8E3E',
        },
      },
      fontFamily: {
        // For the ultra-bold, squished product names (e.g., "Nike TN", "sport shoes")
        display: ['"Impact"', '"Compacta"', '"Anton"', 'sans-serif'],
        // For clean UI elements (e.g., Filters, Price Range, Navigation)
        body: ['"Inter"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
