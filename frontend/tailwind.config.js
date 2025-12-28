/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        bg: "#F7F7F7",
        surface: "#FFFFFF",
        text: "#111827",
        muted: "#6B7280",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        sutil: "0 6px 18px rgba(2, 6, 23, 0.06)",
        elevated: "0 20px 40px rgba(2, 6, 23, 0.12)",
      },
    },
  },
  plugins: [],
};