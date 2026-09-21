import { forwardRef, type ComponentProps, type ElementRef } from "react";
import { StyleSheet, TextInput as NativeTextInput } from "react-native";

import { useTheme } from "../theme";
import { useI18n } from "./I18nProvider";
import { translateLegacyLiteral } from "./literalEn";

type Props = ComponentProps<typeof NativeTextInput>;

export const LocalizedTextInput = forwardRef<ElementRef<typeof NativeTextInput>, Props>(function LocalizedTextInput({ placeholder, placeholderTextColor, style, ...props }, ref) {
  const { language, isRTL } = useI18n();
  const { theme, textScale, isHighContrast } = useTheme();
  const flat = StyleSheet.flatten(style);
  const fontSize = typeof flat?.fontSize === "number" ? Math.min(flat.fontSize * textScale, flat.fontSize + 5) : undefined;
  return <NativeTextInput ref={ref} placeholder={language === "en" && placeholder ? translateLegacyLiteral(placeholder) : placeholder} placeholderTextColor={placeholderTextColor ?? theme.textMuted} style={[style, { borderColor: isHighContrast ? theme.borderStrong : flat?.borderColor, color: theme.text, fontSize, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} {...props} />;
});
