import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#0A0A0A", card: "#161616", primary: "#00E5C2", secondary: "#4BF8FF", sub: "#9B9B9B" },
      fontFamily: { sans: ["Inter", "Arial", "Helvetica", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
