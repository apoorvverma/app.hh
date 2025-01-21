module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A5DF', // The blue color in the header
        secondary: '#ffffff', // White color for text and background
        grayText: '#4A4A4A', // Gray text used in the details
      },
    },
  },
  plugins: [],
};
