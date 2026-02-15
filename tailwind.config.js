/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tu peux personnaliser tes couleurs ici
        primary: "#1e40af",   // Bleu foncé
        secondary: "#64748b", // Gris ardoise
      },
      borderRadius: {
        '3xl': '1.5rem',      // Pour tes cartes ultra-arrondies
      }
    },
  },
  plugins: [],
}
