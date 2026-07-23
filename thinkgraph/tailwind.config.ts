import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ThinkGraph Pro — Modern Dark Cinema + Data-Dense Dashboard
        ink: {
          950: "#020203",
          900: "#050506",
          850: "#0a0a0c",
          800: "#0f1014",
          700: "#16171d",
          600: "#1e2028",
          500: "#282a35",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.05)",
          elevated: "rgba(255, 255, 255, 0.06)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          DEFAULT: "#5E6AD2",
          soft: "#8B94E8",
          glow: "rgba(94, 106, 210, 0.2)",
          muted: "rgba(94, 106, 210, 0.12)",
        },
        teal: { DEFAULT: "#3EDBC2", soft: "#5FEBD6", glow: "rgba(62, 219, 194, 0.15)" },
        amber: { DEFAULT: "#F5A623", soft: "#F7BD5E", glow: "rgba(245, 166, 35, 0.15)" },
        rose: { DEFAULT: "#F25F7B", soft: "#F7899C", glow: "rgba(242, 95, 123, 0.15)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(94, 106, 210, 0.5)",
        "glow-sm": "0 0 20px -8px rgba(94, 106, 210, 0.3)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px -12px rgba(0,0,0,0.7)",
        "card-hover": "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(94,106,210,0.2), 0 12px 50px -12px rgba(0,0,0,0.8)",
        elevated: "0 2px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px -20px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseglow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        pulseglow: "pulseglow 2.4s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
