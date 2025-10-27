/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        soft: "18px",
        xl: "22px"
      },
      transitionTimingFunction: {
        "ease-breath": "cubic-bezier(0.22, 1, 0.36, 1)" // natural ease-out
      },
      colors: {
        background: "#FAF7F2",
        paper: "#EDE7E0",
        espresso: "#2E2A26",
        softGray: "#7E7A74",
      }
    }
  },
  plugins: []
};
