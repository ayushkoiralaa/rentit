/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2454E0",
          dark: "#15318F",
          soft: "#EAF0FE",
        },
        ink: "#12151C",
        muted: "#6B7280",
        line: "#E5E7EB",
        surface: "#F6F7FB",
        success: "#188A4A",
        danger: "#D8402F",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(18,21,28,0.06)",
        "card-hover": "0 8px 20px rgba(18,21,28,0.08)",
      },
    },
  },
  plugins: [],
};
