/**
 * theme.js
 * Data: 2026-11-03
 * Autor: Gabriel / Antigravity
 * Resumo: Centralização total de tema e design tokens da identidade visual da Dra. Alessandra Feitosa.
 */

const theme = {
  colors: {
    primary: "#c07a66",       // Terracota / Rose sofisticado
    primaryDark: "#9d5846",   // Terracota profundo para botões hover/contrastes
    primaryLight: "#e5b7ab",  // Variação suave
    accent: "#cfd0e5",        // Lavanda suave / toque refinado
    accentDark: "#6b6f8a",    // Contraste para textos em acento
    cream: "#f7e9e0",         // Nude pêssego suave
    backgroundLight: "#f8f4f3", // Fundo geral off-white aveludado
    backgroundDark: "#261917",  // Fundo escuro luxuoso (café/terracota nobre)
    white: "#ffffff",
    slateDark: "#2d2928",
    slateMuted: "#6b6260"
  },
  fonts: {
    display: ["Inter", "sans-serif"],
    serif: ["Playfair Display", "serif"]
  },
  shadows: {
    primaryGlow: "0 10px 25px -5px rgba(192, 122, 102, 0.3)",
    cardSoft: "0 4px 20px -2px rgba(192, 122, 102, 0.08)"
  }
};

// Exporta globalmente para uso no Tailwind e no JS
if (typeof window !== "undefined") {
  window.APP_THEME = theme;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = theme;
}

