/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest:  "#1B3A2D",
        river:   "#2A5F7F",
        clay:    "#C17F24",
        cream:   "#F7F2E8",
        parchment: "#EDE7D6",
        bark:    "#2C1A0E",
        sage:    "#6B8C6B",
        mist:    "#E8EEF0",
        slate:   "#4A5E6A",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'Crimson Pro'", "Georgia", "serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
