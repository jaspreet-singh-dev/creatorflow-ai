import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        navy: {
          950: "#070A12", // Deepest background
          900: "#0B101E", // Secondary background / card base
          850: "#0F172A", // Elevated surface
          800: "#162038", // Borders / subtle hover
          700: "#1E2B4A", // Highlights / active border
          600: "#2B3C66",
        },
        brand: {
          purple: "#8B5CF6",
          "purple-hover": "#7C3AED",
          blue: "#3B82F6",
          "blue-hover": "#2563EB",
          cyan: "#06B6D4",
          violet: "#A855F7",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.15)",
        "glow-blue": "0 0 25px -5px rgba(59, 130, 246, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
