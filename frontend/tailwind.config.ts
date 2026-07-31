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
        accentInk: "rgb(var(--color-accent-ink) / <alpha-value>)",

        // Semantic status tokens referenced by StatusBadge / AttendanceStatusBadge /
        // LeaveStatusBadge and various form error boxes. These were used throughout
        // the app but never actually defined here, so they rendered with no color
        // at all (the washed-out/invisible pill bug).
        "status-active": "rgb(var(--color-status-active) / <alpha-value>)",
        "status-activeBg": "rgb(var(--color-status-active-bg) / <alpha-value>)",
        "status-inactive": "rgb(var(--color-status-inactive) / <alpha-value>)",
        "status-inactiveBg": "rgb(var(--color-status-inactive-bg) / <alpha-value>)",
        "status-terminated": "rgb(var(--color-status-terminated) / <alpha-value>)",
        "status-terminatedBg": "rgb(var(--color-status-terminated-bg) / <alpha-value>)",
        "status-present": "rgb(var(--color-status-present) / <alpha-value>)",
        "status-presentBg": "rgb(var(--color-status-present-bg) / <alpha-value>)",
        "status-late": "rgb(var(--color-status-late) / <alpha-value>)",
        "status-lateBg": "rgb(var(--color-status-late-bg) / <alpha-value>)",

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