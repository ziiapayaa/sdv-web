import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        surface: "#f9f9f9",
        border: "#e5e5e5",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      letterSpacing: {
        widest: ".25em",
        "ultra-wide": ".35em",
      },
    },
  },
  plugins: [],
};
export default config;
