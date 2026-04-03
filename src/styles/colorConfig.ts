// src/styles/colorConfig.ts
// Configuración centralizada de colores - ÚNICO ARCHIVO PARA TODOS LOS COLORES
// Modificar aquí para cambiar la paleta completa de la aplicación

export const colorConfig = {
    // Fondos
    bg: {
        primary: "#121212", // Carbón Profundo - Fondo Principal
        surface: "#1E1E24", // Gris Pizarra - Superficie/Tarjetas
        secondary: "#1a1a1f", // Variante de fondo oscuro
    },

    // Acentos
    accent: {
        primary: "#D4AF37", // Oro Muted - Acento Principal
        secondary: "#A0A0A0", // Gris Medio - Elementos inactivos
        hover: "#C9A632", // Oro más oscuro para hover
    },

    // Texto
    text: {
        primary: "#E1E1E1", // Blanco Humo - Texto Principal
        secondary: "#A0A0A0", // Gris Medio - Texto Secundario
        tertiary: "#808080", // Gris más oscuro para texto deshabilitado
        inverted: "#121212", // Texto sobre fondos claros
    },

    // Bordes y Divisores
    border: {
        primary: "#2A2A30", // Gris oscuro - Bordes/Líneas
        secondary: "#333339", // Gris ligeramente más claro
        light: "#1f1f24", // Borde muy sutil
    },

    // Datos Semánticos
    semantic: {
        success: "#2E8B57", // Verde Bosque - Éxito/Positivo/Ingresos
        error: "#CF6679", // Rojo Ladrillo - Error/Negativo/Gastos
        warning: "#FFB74D", // Naranja - Advertencia
        info: "#D4AF37", // Oro - Información
    },

    // Transacciones
    transaction: {
        income: "#2E8B57", // Verde Bosque - Ingresos
        expense: "#CF6679", // Rojo Ladrillo - Gastos
        transfer: "#D4AF37", // Oro - Transferencias
        investment: "#2E8B57", // Verde Bosque - Inversiones
        loan: "#CF6679", // Rojo Ladrillo - Préstamos
        other: "#D4AF37", // Oro - Otros
    },

    // Estados Especiales
    state: {
        active: "#D4AF37", // Estado activo
        disabled: "#666666", // Estado deshabilitado
        hover: "#C9A632", // Estado hover
        focus: "#D4AF37", // Estado focus
    },

    // Sombras (valores RGBA)
    shadow: {
        sm: "rgba(0, 0, 0, 0.1)",
        md: "rgba(0, 0, 0, 0.2)",
        lg: "rgba(0, 0, 0, 0.3)",
        xl: "rgba(0, 0, 0, 0.4)",
    },

    // Utilidades
    utility: {
        white: "#FFFFFF",
        black: "#000000",
        transparent: "transparent",
    },
} as const;

// Exportar objeto plano para compatibilidad y facilidad de uso
export const colors = {
    primaryBg: colorConfig.bg.primary,
    surfaceBg: colorConfig.bg.surface,
    accent: colorConfig.accent.primary,
    accentNegative: colorConfig.semantic.error,
    textPrimary: colorConfig.text.primary,
    textSecondary: colorConfig.text.secondary,
    borderColor: colorConfig.border.primary,
    transactionColors: colorConfig.transaction,
} as const;

// Exportar transactionColors directamente
export const transactionColors = colorConfig.transaction;

// Exportar variables CSS como string para inyectar en estilos
export const cssVariables = `
  --bg-primary: ${colorConfig.bg.primary};
  --bg-surface: ${colorConfig.bg.surface};
  --bg-secondary: ${colorConfig.bg.secondary};

  --accent-primary: ${colorConfig.accent.primary};
  --accent-secondary: ${colorConfig.accent.secondary};
  --accent-hover: ${colorConfig.accent.hover};

  --text-primary: ${colorConfig.text.primary};
  --text-secondary: ${colorConfig.text.secondary};
  --text-tertiary: ${colorConfig.text.tertiary};
  --text-inverted: ${colorConfig.text.inverted};

  --border-primary: ${colorConfig.border.primary};
  --border-secondary: ${colorConfig.border.secondary};
  --border-light: ${colorConfig.border.light};

  --semantic-success: ${colorConfig.semantic.success};
  --semantic-error: ${colorConfig.semantic.error};
  --semantic-warning: ${colorConfig.semantic.warning};
  --semantic-info: ${colorConfig.semantic.info};

  --shadow-sm: ${colorConfig.shadow.sm};
  --shadow-md: ${colorConfig.shadow.md};
  --shadow-lg: ${colorConfig.shadow.lg};
  --shadow-xl: ${colorConfig.shadow.xl};
` as const;
