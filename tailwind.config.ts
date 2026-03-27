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
          bg: "#08090a",
          surface: "#16161a",
          "surface-hover": "#1e1e23",
          "surface-active": "#25252b",
          border: "#26262a",
          "border-light": "#2e2e33",
          "text-primary": "#ededef",
          "text-secondary": "#8a8a8e",
          "text-tertiary": "#5c5c60",
          accent: "#5e6ad2",
          "accent-hover": "#6c78e0",
          "accent-muted": "#5e6ad220",
          sidebar: "#0d0d0f",
        },
        priority: {
          urgent: "#e55561",
          high: "#d4915a",
          medium: "#e5c07b",
          low: "#6b7280",
          none: "#5c5c60",
        },
        status: {
          backlog: "#6b6b70",
          todo: "#d4d4d8",
          "in-progress": "#e5c07b",
          "in-review": "#5B9BD5",
          done: "#50a770",
          cancelled: "#e55561",
        },
        health: {
          "on-track": "#50a770",
          "at-risk": "#d4915a",
          "off-track": "#e55561",
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
