export interface SemanticTheme {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSecondary: string;
  cardBackground: string;
  inputBackground: string;
  navigationBackground: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  border: string;
  borderStrong: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
  mapOverlay: string;
  focusRing: string;
}

export const lightTheme: SemanticTheme = {
  background: "#F8F7F4", surface: "#FFFFFF", surfaceElevated: "#FFFFFF", surfaceSecondary: "#F2EFE8",
  cardBackground: "#FFFFFF", inputBackground: "#FBFAF7", navigationBackground: "#FFFFFF",
  text: "#1A1D20", textSecondary: "#45423C", textMuted: "#6E685E", textInverse: "#FFFFFF",
  primary: "#C59B27", primaryPressed: "#8E7000", primarySoft: "#FFF4C8",
  border: "#E7E2D8", borderStrong: "#B7A985", success: "#087A59", warning: "#A16207",
  danger: "#C81D2A", info: "#1D4ED8", overlay: "rgba(10,18,15,0.46)", mapOverlay: "rgba(255,255,255,0.94)", focusRing: "#8E7000"
};

export const darkTheme: SemanticTheme = {
  background: "#0D1411", surface: "#131C18", surfaceElevated: "#192520", surfaceSecondary: "#202E28",
  cardBackground: "#17211D", inputBackground: "#101814", navigationBackground: "#111A16",
  text: "#F7F3E9", textSecondary: "#D8D5CC", textMuted: "#AEB8B1", textInverse: "#0E1512",
  primary: "#D8AF3C", primaryPressed: "#F0CA5A", primarySoft: "#332D19",
  border: "#34443C", borderStrong: "#6E806F", success: "#41D3A2", warning: "#F2C75B",
  danger: "#FF7B86", info: "#79A9FF", overlay: "rgba(0,0,0,0.72)", mapOverlay: "rgba(19,28,24,0.95)", focusRing: "#F0CA5A"
};

export const highContrastTheme: SemanticTheme = {
  background: "#000000", surface: "#080A09", surfaceElevated: "#101310", surfaceSecondary: "#171A18",
  cardBackground: "#050605", inputBackground: "#000000", navigationBackground: "#000000",
  text: "#FFFFFF", textSecondary: "#FFFFFF", textMuted: "#E8E8E8", textInverse: "#000000",
  primary: "#FFD43B", primaryPressed: "#FFE780", primarySoft: "#2E2900",
  border: "#FFFFFF", borderStrong: "#FFD43B", success: "#54FFBC", warning: "#FFE780",
  danger: "#FF6775", info: "#72B6FF", overlay: "rgba(0,0,0,0.88)", mapOverlay: "#000000", focusRing: "#FFD43B"
};
