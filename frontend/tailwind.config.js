/** @type {import('tailwindcss').Config} */
export default {
  // Configure the paths to all of your template files.
  // Tailwind will scan these files for class names and generate the corresponding CSS.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // The theme section is where you define your project's color palette,
  // type scale, fonts, breakpoints, border radius values, and more.
  theme: {
    // The extend key allows you to add new values to the default theme
    // without overriding them entirely.
    extend: {
      colors: {
        primary: '#030712',
        secondary: '#1d4ed8',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
        'gradient-secondary': 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
      },
    },
  },
  
  // The plugins section allows you to register third-party plugins with Tailwind.
  plugins: [],
};
