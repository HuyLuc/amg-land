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
        sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 14px 34px rgba(15, 23, 42, 0.10)",
        lift: "0 22px 48px rgba(15, 23, 42, 0.16)",
        gold: "0 14px 34px rgba(189, 141, 60, 0.20)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "subtle-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.08)", opacity: "0.18" }
        }
      },
      animation: {
        "fade-up": "fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "soft-float": "soft-float 5s ease-in-out infinite",
        "subtle-pulse": "subtle-pulse 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
