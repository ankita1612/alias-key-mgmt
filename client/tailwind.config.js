/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3F4D67",
        primaryHover: "#424649",
        menuActive: "#1dc4e9", //active menu color
        menuActiveHover: "#15a8c8",
        secondary: "#3B82F6", //secondary text color
        secondaryHover: "#2563EB",
      },
    },
  },
  plugins: [],
};
/* bg-gradient-to-r from-[#3F4D67] to-[#424649]
bg-gradient-to-r from-sidebarSecondary to-sidebarSecondaryHover
 */
