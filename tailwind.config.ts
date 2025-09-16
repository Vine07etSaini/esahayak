import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: "var(--secondary)",
        background: "var(--bg)",
        card: "var(--card)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};
export default config;
