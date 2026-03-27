import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linear: {
          bg: "#0a0a0b",
          surface: "#1b1b1f",
          "surface-hover": "#232328",
          "surface-active": "#2a2a2f",
          border: "#2e2e32",
          "border-light": "#3a3a3f",
          "text-primary": "#ededef",
          "text-secondary": "#8a8a8e",
          "text-tertiary": "#5c5c60",
          accent: "#5e6ad2",
          "accent-hover": "#6c78e0",
          "accent-muted": "#5e6ad220",
          sidebar: "#111113",
        },
        priority: {
          urgent: "#f76b6b",
          high: "#e89b3e",
          medium: "#f2c94c",
          low: "#6b7280",
          none: "#5c5c60",
        },
        status: {
          backlog: "#8a8a8e",
          todo: "#e2e2e3",
          "in-progress": "#f2c94c",
          "in-review": "#2d9cdb",
          done: "#27ae60",
          cancelled: "#ef4444",
        },
        health: {
          "on-track": "#27ae60",
          "at-risk": "#e89b3e",
          "off-track": "#f76b6b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
      },
      animation: {
        "fade-in": "fadeIn 150ms ease",
        "slide-in": "slideIn 150ms ease",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
