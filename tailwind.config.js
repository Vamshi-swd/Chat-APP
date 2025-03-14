module.exports = {
  mode: "jit", // Ensure JIT mode is enabled
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "font-bold",
    "font-extrabold",
    "font-black",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
