import { Children, forwardRef, type ComponentProps, type ElementRef, type ReactNode } from "react";
import { StyleSheet, Text as NativeText } from "react-native";

import { useTheme } from "../theme";
import { useI18n } from "./I18nProvider";
import { translateLegacyLiteral } from "./literalEn";

type Props = ComponentProps<typeof NativeText>;

export const LocalizedText = forwardRef<ElementRef<typeof NativeText>, Props>(function LocalizedText({ children, style, ...props }, ref) {
  const { language, isRTL } = useI18n();
  const { textScale } = useTheme();
  const flat = StyleSheet.flatten(style);
  const fontSize = typeof flat?.fontSize === "number" ? Math.min(flat.fontSize * textScale, flat.fontSize + 6) : undefined;
  const translateNode = (node: ReactNode) => language === "en" && typeof node === "string" ? translateLegacyLiteral(node) : node;
  const translatedChildren = Children.map(children, translateNode);
  return <NativeText ref={ref} style={[style, { fontSize, writingDirection: isRTL ? "rtl" : "ltr" }]} {...props}>{translatedChildren}</NativeText>;
});
