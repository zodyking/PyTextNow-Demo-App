import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        electric: {
          50: "#e6f1ff",
          100: "#b3d9ff",
          200: "#80c1ff",
          300: "#4da9ff",
          400: "#1a91ff",
          500: "#0079e6",
          600: "#0061b3",
          700: "#004980",
          800: "#00314d",
          900: "#00191a",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          background: "#000000",
          foreground: "#ffffff",
          primary: {
            50: "#e6f1ff",
            100: "#b3d9ff",
            200: "#80c1ff",
            300: "#4da9ff",
            400: "#1a91ff",
            500: "#0079e6",
            600: "#0061b3",
            700: "#004980",
            800: "#00314d",
            900: "#00191a",
            DEFAULT: "#0079e6",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#1a1a1a",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};

export default config;


