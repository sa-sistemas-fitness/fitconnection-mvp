/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          400: "#4b83ff",
          500: "#2867f0",
          600: "#1e56db",
          950: "#071431",
        },
      },
      boxShadow: {
        glow: "0 18px 60px rgba(37, 99, 235, 0.22)",
      },
    },
  },
  plugins: [],
};
