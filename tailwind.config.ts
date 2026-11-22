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
        obsidian: {
          950: "#030712", // Pure midnight depth
          900: "#070B16", // Deep canvas base
          850: "#0B101F", // Card background
          800: "#11182D", // Card border / elevated surface
          750: "#17223D", // Highlight surface
          700: "#1F2E52", // Active border
        },
        navy: {
          950: "#050814",
          900: "#090E1D",
          850: "#0E152B",
          800: "#141E3C",
          700: "#1C2A54",
          600: "#273970",
        },
        brand: {
          purple: "#8B5CF6",
          "purple-hover": "#7C3AED",
          blue: "#3B82F6",
          "blue-hover": "#2563EB",
          cyan: "#06B6D4",
          violet: "#A855F7",
          fuchsia: "#D946EF",
          amber: "#F59E0B",
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
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 25px -4px rgba(139, 92, 246, 0.25)",
        "glow-lg": "0 0 45px -5px rgba(139, 92, 246, 0.35)",
        "glow-cyan": "0 0 30px -4px rgba(6, 182, 212, 0.25)",
        "glow-amber": "0 0 30px -4px rgba(245, 158, 11, 0.25)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "card-hover": "0 20px 45px -10px rgba(139, 92, 246, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
        glass: "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
      },
      backgroundImage: {
        "radial-grid": "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.18) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 80%)",
        "prismatic-gradient": "linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #06B6D4 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
