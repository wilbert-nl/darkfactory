import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#161a22",
        line: "#242a36",
        accent: "#7c9cf6",
        muted: "#8a93a6",
      },
    },
  },
  plugins: [],
} satisfies Config;
