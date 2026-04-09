/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      colors: {
        primary: "#C5B4A3",
        secondary: "#FFEAF4",

        // Optional structured palette (recommended)
        brand: {
          light: "#FFEAF4",
          DEFAULT: "#C5B4A3",
          dark: "#A38F7C",
        },
      },

      screens: {
        xs: "480px",        // mobile custom
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1700px",    // your largeScreens

        // height-based media queries
        short: { raw: "(max-height: 600px)" },
        medium: { raw: "(min-height: 601px) and (max-height: 899px)" },
        tall: { raw: "(min-height: 900px)" },
      },

      container: {
        center: true,
        padding: "1rem",
      },
    },
  },

  plugins: [],
};