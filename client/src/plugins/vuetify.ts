import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Definir tema personalizado
const customTheme = {
  dark: false,
  colors: {
    primary: "#4CAF50",
    secondary: "#2196F3",
    accent: "#FF9800",
    error: "#F44336",
    warning: "#FFC107",
    info: "#2196F3",
    success: "#4CAF50",
    surface: "#FFFFFF",
    background: "#F5F5F5",
  },
};

const customDarkTheme = {
  dark: true,
  colors: {
    primary: "#66BB6A",
    secondary: "#42A5F5",
    accent: "#FFB74D",
    error: "#EF5350",
    warning: "#FFCA28",
    info: "#42A5F5",
    success: "#66BB6A",
    surface: "#1E1E1E",
    background: "#121212",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "customTheme",
    themes: {
      customTheme,
      customDarkTheme,
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      variant: "elevated",
      style: "text-transform: none;",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
    },
    VCard: {
      elevation: 2,
    },
  },
});
