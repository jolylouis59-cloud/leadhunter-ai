import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          text: "#2B2B2B",
          cta: "#1F4D3A",
          "cta-hover": "#2a6b50",
          oatmeal: "#F3EDE2",
          border: "#E0E0E0",
          dark: "#2B2B2B",
          muted: "#666666",
          surface: "#F9F9F9",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1100px",
      },
      letterSpacing: {
        heading: "-0.02em",
      },
      boxShadow: {
        hero: "0 20px 60px rgba(0,0,0,0.08)",
        growth: "0 20px 50px rgba(31,77,58,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
