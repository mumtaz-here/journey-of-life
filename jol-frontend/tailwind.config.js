import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* 🎨 Colors — Playful Serenity Palette */
      colors: {
        cream: "#FAF7F2",
        beige: "#CBB9A8",
        sage: "#9EC3B0",
        coral: "#F2B8A2",
        espresso: "#2E2A26",
        soft: "#7E7A74",
        border: "#E8E1DA",
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },

      /* ✨ Fonts */
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        dm: ["DM Sans", "sans-serif"],
      },

      /* 💨 Transition & Timing */
      transitionTimingFunction: {
        "ease-breath": "cubic-bezier(0.45, 0, 0.55, 1)",
      },
      transitionDuration: {
        calm: "400ms",
        slow: "700ms",
      },

      /* 🌿 Shadows */
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        glow: "0 0 6px rgba(155,195,176,0.35)",
        "glow-coral": "0 0 6px rgba(242,184,162,0.35)",
      },

      /* 🌸 Keyframes & Animations */
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "hover-breath": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(155,195,176,0)" },
          "50%": { boxShadow: "0 0 12px rgba(155,195,176,0.4)" },
        },
        /* 🩵 new micro feedbacks */
        clickRipple: {
          "0%": { transform: "scale(0)", opacity: "0.4" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-breath both",
        breath: "hover-breath 2.5s ease-breath infinite",
        glow: "pulseGlow 3s ease-in-out infinite",
        clickRipple: "clickRipple 0.6s ease-breath",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
});
