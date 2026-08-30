import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
          border: "var(--bg-border)",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          blue: "#3b82f6",
          indigo: "#6366f1",
          violet: "#8b5cf6",
        },
        gate: {
          answered: "#10b981",
          unanswered: "#ef4444",
          review: "#8b5cf6",
          visited: "#64748b",
          notVisited: "#334155",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          accent: "#3b82f6",
        },
        difficulty: {
          easy: "#10b981",
          medium: "#f59e0b",
          hard: "#ef4444",
          unrated: "#64748b",
        },
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(59,130,246,0.25)",
        "glow-sm": "0 0 10px rgba(59,130,246,0.15)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
        "gradient-card": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        "gradient-dark": "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        "mesh-glow": "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(79,126,255,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(79,126,255,0.45)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
