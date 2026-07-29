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
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        lineHover: "rgb(var(--color-line-hover) / <alpha-value>)",

        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentHover: "rgb(var(--color-accent-hover) / <alpha-value>)",
        accentTint: "rgb(var(--color-accent-tint) / <alpha-value>)",

        emeraldPri: "rgb(var(--color-emerald-primary) / <alpha-value>)",
        emeraldBg: "rgb(var(--color-emerald-bg) / <alpha-value>)",
        emeraldTxt: "rgb(var(--color-emerald-text) / <alpha-value>)",

        amberPri: "rgb(var(--color-amber-primary) / <alpha-value>)",
        amberBg: "rgb(var(--color-amber-bg) / <alpha-value>)",
        amberTxt: "rgb(var(--color-amber-text) / <alpha-value>)",

        rosePri: "rgb(var(--color-rose-primary) / <alpha-value>)",
        roseBg: "rgb(var(--color-rose-bg) / <alpha-value>)",
        roseTxt: "rgb(var(--color-rose-text) / <alpha-value>)",

        sidebarBg: "rgb(var(--color-sidebar) / <alpha-value>)",
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
        xl: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
