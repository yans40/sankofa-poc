/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orisha: { primary: '#8B4513', secondary: '#D2691E', accent: '#FFD700' },
        zulu: { primary: '#2F4F2F', secondary: '#556B2F', accent: '#DC143C' },
        spectral: '#9B59B6',
      },
    },
  },
  plugins: [],
};
