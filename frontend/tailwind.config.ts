import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e9ff",
          200: "#b9d5fb",
          500: "#2e5fa3",
          700: "#244c82",
          900: "#1f3864"
        },
        gold: {
          400: "#d8aa56",
          500: "#bd8d3c"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 55px rgba(31, 56, 100, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
