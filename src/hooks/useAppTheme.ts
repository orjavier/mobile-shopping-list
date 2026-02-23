/**
 * useAppTheme — Paleta de colores centralizada para toda la aplicación.
 *
 * Uso:
 *   const { colors, isDark } = useAppTheme();
 *   <View style={{ backgroundColor: colors.screenBackgroundColor }} />
 */

import { useColorScheme } from "@/components/useColorScheme";

// ─── Constante global de color de marca ──────────────────────────────────────
export const PRIMARY_COLOR = "#FF6C37";
export const PRIMARY_COLOR_LIGHT = "#FF8C5A";

// ─── Paleta de colores de categorías usados en picker ─────────────────────────
export const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

// ─── Tokens para modo claro ───────────────────────────────────────────────────
const LIGHT_THEME = {
  // ── Fondos generales ──────────────────────────────────────────────────────
  /** Fondo principal de cada pantalla */
  screenBackgroundColor: "#F9FAFB",
  /** Fondo de tarjetas, sheets y superficies elevadas */
  surfaceBackgroundColor: "#FFFFFF",
  /** Fondo del header/barra superior */
  headerBackgroundColor: "#FFFFFF",
  /** Fondo de la barra de búsqueda */
  searchBarBackgroundColor: "#FFFFFF",
  /** Fondo del pie de página (footer) */
  footerBackgroundColor: "#FFFFFF",
  /** Fondo de la barra de acciones (mic / FAB / QR) */
  actionBarBackgroundColor: "#FFFFFF",
  /** Fondo del bottom sheet (RBSheet) */
  bottomSheetBackgroundColor: "#FFFFFF",

  // ── Fondos de elementos de lista / tarjetas ───────────────────────────────
  /** Fondo de la tarjeta de lista de compras */
  listCardBackgroundColor: "#FFFFFF",
  /** Fondo de la tarjeta de categoría */
  categoryCardBackgroundColor: "#FFFFFF",
  /** Fondo de la tarjeta de producto */
  productCardBackgroundColor: "#FFFFFF",
  /** Fondo del contenedor de imagen del producto */
  productImageBackgroundColor: "#FFFFFF",
  /** Fondo del círculo de ícono en la lista de compras */
  listCardIconBackgroundColor: "#FFFFFF",

  // ── Fondos de inputs ──────────────────────────────────────────────────────
  /** Fondo de los campos de texto / inputs */
  inputBackgroundColor: "#FFFFFF",

  // ── Fondos del drawer / navegación ───────────────────────────────────────
  /** Fondo del ítem de menú activo en el drawer */
  drawerItemActiveBackgroundColor: "#FFF1EE",
  /** Fondo del ícono de menú inactivo */
  drawerIconInactiveBackgroundColor: "#FFFFFF",
  /** Fondo del ícono de menú activo */
  drawerIconActiveBackgroundColor: "#FFEBE6",

  // ── Colores de texto ──────────────────────────────────────────────────────
  /** Texto principal (títulos, contenido principal) */
  primaryTextColor: "#0F172A",
  /** Texto secundario / subtítulo */
  secondaryTextColor: "#64748B",
  /** Texto terciario / sugerencias / placeholders */
  tertiaryTextColor: "#94A3B8",
  /** Texto de inputs y campos editables */
  inputTextColor: "#0F172A",
  /** Texto de los ítems del drawer */
  drawerItemTextColor: "#1A1C1E",
  /** Texto del botón de logout */
  logoutTextColor: "#64748B",
  /** Texto de ítems completados / tachados */
  completedItemTextColor: "#CBD5E1",

  // ── Colores de borde ──────────────────────────────────────────────────────
  /** Borde general de tarjetas y contenedores */
  borderColor: "#E2E8F0",
  /** Borde de inputs */
  inputBorderColor: "#E5E5EA",
  /** Borde de tarjetas de lista */
  listCardBorderColor: "#FFE4D6",
  /** Borde de tarjetas de producto */
  productCardBorderColor: "#F1F5F9",
  /** Borde del footer */
  footerBorderColor: "#F1F5F9",
  /** Borde de la barra de acciones */
  actionBarBorderColor: "#E2E8F0",
  /** Borde del checkbox (ítems no completados) */
  checkboxBorderColor: "#CBD5E1",
  /** Divisor (líneas entre elementos) */
  dividerColor: "rgba(148,163,184,0.18)",
  /** Divisor del drawer */
  drawerDividerColor: "#F1F3F5",
  /** Color del flecha/chevron de listas */
  chevronColor: "#CBD5E1",

  // ── Colores de estado ─────────────────────────────────────────────────────
  /** Color del texto de estado "Abierto" */
  statusOpenTextColor: "#22C55E",
  /** Fondo del badge de estado "Abierto" */
  statusOpenBackgroundColor: "#DCFCE7",

  // ── Colores específicos de componentes ────────────────────────────────────
  /** Borde del anillo del avatar en el drawer */
  avatarRingColor: "#FFEDE8",
  /** Color del punto de estado activo (online) */
  onlineDotColor: "#2BD470",
  /** Handle / barra de arrastre del bottom sheet */
  draggableHandleColor: "#DDDDDD",
  /** Ícono de volver / back */
  backButtonIconColor: "#374151",
  /** Fondo del botón de volver */
  backButtonBackgroundColor: "#F1F5F9",
  /** Fondo del ícono de la configuración en Settings */
  settingsIconBackgroundColor: "#FFF0EE",
  /** Color del label de color de categoría */
  colorLabelTextColor: "#666666",
  /** Color de la etiqueta de sección */
  sectionLabelTextColor: "#94A3B8",
};

// ─── Tokens para modo oscuro ──────────────────────────────────────────────────
const DARK_THEME: typeof LIGHT_THEME = {
  // ── Fondos generales ──────────────────────────────────────────────────────
  screenBackgroundColor: "#0F0F0F",
  surfaceBackgroundColor: "#1E1E1E",
  headerBackgroundColor: "rgba(15,15,15,0.90)",
  searchBarBackgroundColor: "#1A1A1A",
  footerBackgroundColor: "#121212",
  actionBarBackgroundColor: "#1E1E1E",
  bottomSheetBackgroundColor: "#1C1C1E",

  // ── Fondos de elementos de lista / tarjetas ───────────────────────────────
  listCardBackgroundColor: "rgba(255,255,255,0.06)",
  categoryCardBackgroundColor: "rgba(255,255,255,0.06)",
  productCardBackgroundColor: "rgba(255,255,255,0.04)",
  productImageBackgroundColor: "#1E1E1E",
  listCardIconBackgroundColor: `${PRIMARY_COLOR}28`,

  // ── Fondos de inputs ──────────────────────────────────────────────────────
  inputBackgroundColor: "#252525",

  // ── Fondos del drawer / navegación ───────────────────────────────────────
  drawerItemActiveBackgroundColor: "#2C1A16",
  drawerIconInactiveBackgroundColor: "#222222",
  drawerIconActiveBackgroundColor: "#3D241E",

  // ── Colores de texto ──────────────────────────────────────────────────────
  primaryTextColor: "#F1F5F9",
  secondaryTextColor: "#94A3B8",
  tertiaryTextColor: "#64748B",
  inputTextColor: "#F1F5F9",
  drawerItemTextColor: "#FFFFFF",
  logoutTextColor: "#555555",
  completedItemTextColor: "#3F3F46",

  // ── Colores de borde ──────────────────────────────────────────────────────
  borderColor: "#2D2D2D",
  inputBorderColor: "rgba(255,255,255,0.2)",
  listCardBorderColor: "rgba(255,255,255,0.10)",
  productCardBorderColor: "rgba(255,255,255,0.07)",
  footerBorderColor: "#1F1F23",
  actionBarBorderColor: "#2D2D2D",
  checkboxBorderColor: "#3F3F46",
  dividerColor: "rgba(255,255,255,0.06)",
  drawerDividerColor: "rgba(255,255,255,0.08)",
  chevronColor: "#4B5563",

  // ── Colores de estado ─────────────────────────────────────────────────────
  statusOpenTextColor: "#4ADE80",
  statusOpenBackgroundColor: "rgba(74,222,128,0.15)",

  // ── Colores específicos de componentes ────────────────────────────────────
  avatarRingColor: PRIMARY_COLOR,
  onlineDotColor: "#2BD470",
  draggableHandleColor: "#555555",
  backButtonIconColor: "#D1D5DB",
  backButtonBackgroundColor: "rgba(255,255,255,0.08)",
  settingsIconBackgroundColor: "#3D211F",
  colorLabelTextColor: "#94A3B8",
  sectionLabelTextColor: "#52525B",
};

// ─── Tipo exportado para uso en componentes ───────────────────────────────────
export type AppColors = typeof LIGHT_THEME;

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors: AppColors = isDark ? DARK_THEME : LIGHT_THEME;
  return { colors, isDark };
}
