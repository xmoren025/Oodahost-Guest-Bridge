// src/utils/themes.js

export const propertyThemes = {
  LuxuryPenthouse: {
    id: "LuxuryPenthouse",
    name: "Luxury Penthouse",
    description: "Premium experience with panoramic city views.",
    features: ["Concierge 24/7", "Smart Home", "Private Pool"],
    // Estética: Oscura, Elegante, Dorada, Minimalista
    styles: {
      background: "#121212",       // Negro profundo
      cardBg: "#1e1e1e",           // Gris oscuro
      text: "#e0e0e0",             // Blanco suave
      accent: "#d4af37",           // Dorado
      border: "1px solid #333",
      borderRadius: "0px",         // Bordes rectos (moderno)
      fontFamily: "'Helvetica Neue', sans-serif",
      buttonShadow: "0 4px 15px rgba(212, 175, 55, 0.2)"
    }
  },
  ForestCabin: {
    id: "ForestCabin",
    name: "Forest Cabin",
    description: "Cozy retreat surrounded by ancient pines.",
    features: ["Fireplace", "Hiking Trails", "Wooden Interior"],
    // Estética: Cálida, Natural, Maderas, Redondeada
    styles: {
      background: "#f4f1ea",       // Crema/Papel
      cardBg: "#ffffff",           // Blanco
      text: "#4a3b32",             // Café madera
      accent: "#558b2f",           // Verde bosque
      border: "2px solid #d7ccc8",
      borderRadius: "16px",        // Bordes muy redondos (acogedor)
      fontFamily: "'Georgia', serif",
      buttonShadow: "0 4px 10px rgba(85, 139, 47, 0.3)"
    }
  }
};