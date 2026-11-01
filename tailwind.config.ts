import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d10",
        panel: "#14181e",
        panel2: "#1a2028",
        ink: "#eef2f6",
        muted: "#98a4b3",
        line: "#2a323d",
        accent: "#f04438",
        amber: "#f5b942",
        success: "#35c98a",
        info: "#66a9ff",
        danger: "#f04438",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 70px -12px rgba(240,68,56,0.5)",
        panel: "0 18px 50px -30px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(42,50,61,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(42,50,61,0.35) 1px, transparent 1px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scan: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 6s ease-in-out infinite",
        scan: "scan 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
