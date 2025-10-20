/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#F1F5F9",
        },
        accent: "#38BDF8",
        background: "#F8FAFC",
        card: "#FFFFFF",
        success: "#16A34A",
        danger: "#DC2626",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
