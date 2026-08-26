import type { Config } from "tailwindcss";

/**
 * Tailwind v4 reads its design tokens from `@theme` in `src/app/globals.css`
 * — that file is the real source of truth and works with zero config file.
 * This config exists as a typed, greppable mirror of the same brand tokens
 * for editors/tooling that expect one, and as a place to hang future
 * plugins or content overrides. It is not wired in via `@config` and can
 * be deleted without changing how anything renders.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-bg": "#f5f5f0",
        "brand-ink": "#1a1a1a",
        "brand-ink-muted": "#6b6b6b",
        "brand-card": "#3d2b2b",
        "brand-card-foreground": "#f5f5f0",
        "brand-accent": "#8b4513",
      },
      fontFamily: {
        serif: ["var(--font-display)"],
        sans: ["var(--font-body)"],
      },
    },
  },
};

export default config;
