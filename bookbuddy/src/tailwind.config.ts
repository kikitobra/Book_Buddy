import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B10",
        panel: "#0F111A",
        line: "rgba(255,255,255,0.08)",
        neon: {
          pink: "#FF4DCD",
          purple: "#9A6BFF",
          blue: "#2FD8FF",
          mint: "#5CFFD8",
          amber: "#FFC76B",
        },
      },
      boxShadow: { glow: "0 0 40px rgba(159,102,255,.25)" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
