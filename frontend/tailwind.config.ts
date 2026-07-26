import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces & text — CSS-variable backed so every existing utility
        // (bg-canvas, text-ink, border-line, bg-surface, text-muted) flips
        // automatically with the data-theme attribute on <html>. No dark:
        // prefixes needed anywhere that already uses these tokens.
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",

        // Primary action color. Also variable-backed: deep forest teal in
        // light mode, a brighter teal in dark mode so it still pops against
        // a near-black surface instead of going muddy.
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentHover: "rgb(var(--color-accent-hover) / <alpha-value>)",
        accentTint: "rgb(var(--color-accent-tint) / <alpha-value>)",
        accentInk: "rgb(var(--color-accent-ink) / <alpha-value>)",

        // Static decorative scale — avatar palette, badge tints. Doesn't
        // need to flip; it's used at low-opacity/tint strengths already.
        brand: {
          50: "#EAF2EF",
          100: "#CFE2DB",
          400: "#3E7A6B",
          500: "#2D5D53",
          600: "#234A42",
          700: "#1A3831",
        },

        status: {
          active: "rgb(var(--color-status-active) / <alpha-value>)",
          activeBg: "rgb(var(--color-status-activeBg) / <alpha-value>)",
          inactive: "rgb(var(--color-status-inactive) / <alpha-value>)",
          inactiveBg: "rgb(var(--color-status-inactiveBg) / <alpha-value>)",
          terminated: "rgb(var(--color-status-terminated) / <alpha-value>)",
          terminatedBg: "rgb(var(--color-status-terminatedBg) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
