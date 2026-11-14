module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', "Palatino", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#0f6b6f",
          "primary-content": "#ffffff",
          secondary: "#e9a820",
          "secondary-content": "#2b1d00",
          accent: "#b45309",
          "accent-content": "#ffffff",
          neutral: "#17302f",
          "neutral-content": "#eef4f3",
          "base-100": "#fbfcfb",
          "base-200": "#eef2f1",
          "base-300": "#d9e1df",
          "base-content": "#17302f",
          info: "#0369a1",
          success: "#15803d",
          warning: "#b45309",
          error: "#b91c1c",
        },
        dark: {
          primary: "#4cc2c0",
          "primary-content": "#062526",
          secondary: "#f0b93a",
          "secondary-content": "#2b1d00",
          accent: "#f59e0b",
          "accent-content": "#2b1d00",
          neutral: "#1d3335",
          "neutral-content": "#e3eeed",
          "base-100": "#0f1c1d",
          "base-200": "#142527",
          "base-300": "#1f3638",
          "base-content": "#e3eeed",
          info: "#38bdf8",
          success: "#4ade80",
          warning: "#fbbf24",
          error: "#f87171",
        },
      },
    ],
  },
};
