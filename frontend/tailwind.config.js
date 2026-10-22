/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#111315",
        line: "#30322d",
        mist: "#a5a59b",
        signal: "#c8d96a",
        earth: "#d99a5b",
        "earth-light": "#e8b77f",
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Iowan Old Style"', "Georgia", "serif"],
        mono: ['"SFMono-Regular"', "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 28px rgba(200, 217, 106, 0.12)",
      },
    },
  },
  plugins: [],
};
