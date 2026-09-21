import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { lightTheme, type SemanticTheme } from "./themes";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
let activeTheme: SemanticTheme = lightTheme;
let activeHighContrast = false;
let activeRTL = true;

export function setAdaptiveTheme(theme: SemanticTheme, highContrast: boolean) {
  activeTheme = theme;
  activeHighContrast = highContrast;
}

export function setAdaptiveDirection(isRTL: boolean) { activeRTL = isRTL; }

const whiteSurfaces = new Set(["#FFFFFF", "#FFF", "WHITE", "#FBFBFA", "#FBFAF7", "#FAFAF9", "#FAF9F6", "#F8F7F4", "#F7F7F6"]);
const paleSurfaces = new Set(["#FFF8E3", "#FFF4C8", "#FFFBEB", "#F8FAFC", "#F1F5F9", "#F0FDF4", "#ECFDF5", "#EFF6FF", "#EDE9FE", "#FFF1F2", "#CCFBF1", "#DBEAFE", "#D1FAE5", "#E2E8F0", "#FEF3C7", "#E7E5E4"]);
const darkText = new Set(["#1A1D20", "#132A24", "#0F172A", "#111827", "#1E293B", "#334155", "#45423C"]);
const mutedText = new Set(["#625D54", "#64748B", "#6B7280", "#94A3B8", "#475569", "#6E685E"]);
const borders = new Set(["#E7E2D8", "#ECE7DC", "#F0ECE3", "#F3F1EC", "#E2E8F0", "#CBD5E1", "#E5E7EB", "#EEDB9D", "#FECDD3", "#A7E6CD"]);

function normalize(value: string) { return value.toUpperCase(); }
function mapColor(property: string, value: string): string {
  if (value.startsWith("rgba") || value === "transparent") return value;
  const color = normalize(value);
  if (property === "backgroundColor") {
    if (whiteSurfaces.has(value) || whiteSurfaces.has(color)) return color === "#F8F7F4" || color === "#F7F7F6" ? activeTheme.background : activeTheme.cardBackground;
    if (paleSurfaces.has(value) || paleSurfaces.has(color)) return activeTheme.surfaceSecondary;
    if (color === "#132A24" || color === "#0F2922" || color === "#102A24") return activeTheme.surfaceElevated;
  }
  if (property.toLowerCase().includes("border")) return borders.has(value) || borders.has(color) ? (activeHighContrast ? activeTheme.borderStrong : activeTheme.border) : value;
  if (property === "color") {
    if (darkText.has(value) || darkText.has(color)) return activeTheme.text;
    if (mutedText.has(value) || mutedText.has(color)) return activeTheme.textMuted;
    if (color === "#8C6D14" || color === "#A17A16" || color === "#B58100" || color === "#BF8537") return activeTheme.primaryPressed;
    if (color === "#C59B27") return activeTheme.primary;
  }
  return value;
}

function adaptStyle(style: ViewStyle | TextStyle | ImageStyle) {
  const flattened = StyleSheet.flatten(style) ?? {};
  const result: Record<string, unknown> = {};
  for (const [property, value] of Object.entries(flattened)) {
    if (property === "flexDirection" && value === "row-reverse") result[property] = activeRTL ? "row-reverse" : "row";
    else if (property === "textAlign" && value === "right") result[property] = activeRTL ? "right" : "left";
    else if (property === "writingDirection" && value === "rtl") result[property] = activeRTL ? "rtl" : "ltr";
    else result[property] = typeof value === "string" && (property === "color" || property.toLowerCase().includes("color")) ? mapColor(property, value) : value;
  }
  if (activeHighContrast && result.borderWidth === 1) result.borderWidth = 2;
  return result;
}

export function createAdaptiveStyleSheet<T extends NamedStyles<T>>(styles: T): T {
  return new Proxy(styles, { get(target, property: string | symbol) { if (typeof property !== "string") return Reflect.get(target, property); const style = target[property as keyof T]; return style ? adaptStyle(style) : undefined; } });
}
