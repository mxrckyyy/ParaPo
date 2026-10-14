import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A",
          dark: "#15803D",
        },
        asphalt: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
        },
        fare: "#F59E0B",
        surface: "#F8FAFC",
        line: "#E2E8F0",
        severity: {
          info: "#2563EB",
          warning: "#D97706",
          critical: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
