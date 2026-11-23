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
        // Deep Void Obsidian Canvas
        void: {
          950: "#030508", // Purest deep midnight
          900: "#060911", // Canvas background
          850: "#0A0E1A", // Elevated surface / card base
          800: "#101628", // Card border
          750: "#161E34", // Highlight border
          700: "#1F2B48", // Active state
        },
        // Electric Hyper-Mint (Primary Brand Accent)
        mint: {
          400: "#00F5A0",
          500: "#00D26A",
          600: "#059669",
        },
        // Cyber Cyan (Secondary Accent)
        cyber: {
          400: "#00D8F6",
          500: "#06B6D4",
          600: "#0284C7",
        },
        // Solar Amber (Engagement & Metric Highlight)
        solar: {
          400: "#FFB800",
          500: "#F59E0B",
          600: "#D97706",
        },
        // Mapped brand tokens for instant site-wide transformation
        brand: {
          purple: "#00F5A0", // Transformed from purple to Electric Hyper-Mint!
          "purple-hover": "#00D26A",
          blue: "#00D8F6",   // Transformed to Cyber Cyan!
          "blue-hover": "#0284C7",
          mint: "#00F5A0",
          cyan: "#00D8F6",
          amber: "#FFB800",
          emerald: "#10B981",
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
        glow: "0 0 25px -4px rgba(0, 245, 160, 0.35)",
        "glow-lg": "0 0 45px -5px rgba(0, 245, 160, 0.5)",
        "glow-cyan": "0 0 30px -4px rgba(0, 216, 246, 0.35)",
        "glow-amber": "0 0 30px -4px rgba(255, 184, 0, 0.35)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "card-hover": "0 20px 45px -10px rgba(0, 245, 160, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)",
        glass: "0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)",
      },
      backgroundImage: {
        "radial-grid": "radial-gradient(rgba(0, 245, 160, 0.12) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(0, 245, 160, 0.22) 0%, rgba(0, 216, 246, 0.08) 50%, transparent 80%)",
        "aurora-gradient": "linear-gradient(135deg, #00F5A0 0%, #00D8F6 50%, #FFB800 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
