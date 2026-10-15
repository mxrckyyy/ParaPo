import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981",
          dark: "#059669",
          light: "#D1FAE5",
        },
        asphalt: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
        },
        fare: "#F59E0B",
        accent: "#F59E0B",
        surface: "#F9FAFB",
        card: "#FFFFFF",
        line: "#E2E8F0",
        severity: {
          info: "#2563EB",
          warning: "#D97706",
          critical: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
