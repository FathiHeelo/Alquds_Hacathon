import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { I18nManager, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { useAccessibilityPreferences } from "../../../shared/preferences/AccessibilityPreferencesProvider";
import type { AppLanguage, AppearanceMode } from "../../../shared/preferences/types";
import { radius, spacing, typography, useTheme } from "../../../shared/theme";

const appearanceOptions: ReadonlyArray<{ value: AppearanceMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: "light", label: "settings.light", icon: "sunny-outline" },
  { value: "dark", label: "settings.dark", icon: "moon-outline" },
  { value: "high_contrast", label: "settings.highContrast", icon: "contrast-outline" },
  { value: "system", label: "settings.system", icon: "phone-portrait-outline" }
];

export function AccessibilitySettingsScreen() {
  const navigation = useNavigation();
  const { preferences, updatePreferences } = useAccessibilityPreferences();
  const { t, isRTL } = useI18n();
  const { theme, textScale, isHighContrast } = useTheme();
  const rowDirection = isRTL ? "row-reverse" : "row";
  const align = isRTL ? "right" : "left";

  const setLanguage = (language: AppLanguage) => {
    updatePreferences({ language });
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== (language === "ar")) I18nManager.forceRTL(language === "ar");
  };

  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
    <View style={[styles.header, { flexDirection: rowDirection, borderBottomColor: theme.border }]}>
      <Pressable accessibilityLabel={t("common.back")} accessibilityRole="button" onPress={() => navigation.goBack()} style={[styles.back, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}><Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} color={theme.text} size={22} /></Pressable>
      <View style={styles.headerCopy}><Text style={[styles.title, { color: theme.text, fontSize: 22 * textScale, textAlign: align }]}>{t("settings.title")}</Text><Text style={[styles.subtitle, { color: theme.textMuted, fontSize: 11 * textScale, textAlign: align }]}>{t("settings.subtitle")}</Text></View>
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionTitle text={t("settings.language")} />
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isHighContrast ? 2 : 1 }]}>
        {(["ar", "en"] as const).map((language) => <Choice key={language} checked={preferences.language === language} icon="language-outline" label={t(language === "ar" ? "settings.arabic" : "settings.english")} onPress={() => setLanguage(language)} />)}
      </View>

      <SectionTitle text={t("settings.appearance")} />
      <View style={[styles.grid, { flexDirection: rowDirection }]}>{appearanceOptions.map((option) => {
        const checked = preferences.appearance === option.value;
        return <Pressable accessibilityRole="radio" accessibilityState={{ checked }} key={option.value} onPress={() => updatePreferences({ appearance: option.value })} style={[styles.mode, { backgroundColor: checked ? theme.primarySoft : theme.cardBackground, borderColor: checked ? theme.focusRing : theme.border, borderWidth: checked || isHighContrast ? 2 : 1 }]}><Ionicons name={option.icon} color={checked ? theme.primaryPressed : theme.textMuted} size={22} /><Text style={[styles.modeText, { color: theme.text, fontSize: 11 * textScale }]}>{t(option.label)}</Text>{checked ? <Ionicons name="checkmark-circle" color={theme.primaryPressed} size={17} /> : null}</Pressable>;
      })}</View>

      <SectionTitle text={t("settings.accessibility")} />
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isHighContrast ? 2 : 1 }]}>
        <Toggle label={t("settings.largeText")} hint={t("settings.largeTextHint")} value={preferences.textSize === "large"} onChange={(value) => updatePreferences({ textSize: value ? "large" : "normal" })} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Toggle label={t("settings.reduceMotion")} hint={t("settings.reduceMotionHint")} value={preferences.reduceMotion} onChange={(reduceMotion) => updatePreferences({ reduceMotion })} />
      </View>

      <SectionTitle text={t("settings.preview")} />
      <View style={[styles.preview, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderStrong, borderWidth: isHighContrast ? 2 : 1 }]}><Ionicons name="accessibility" size={28} color={theme.primary} /><View style={styles.previewCopy}><Text style={[styles.previewTitle, { color: theme.text, fontSize: 15 * textScale, textAlign: align }]}>{t("settings.sampleTitle")}</Text><Text style={[styles.previewBody, { color: theme.textMuted, fontSize: 11 * textScale, textAlign: align }]}>{t("settings.sampleBody")}</Text></View></View>
      <Text style={[styles.notice, { color: theme.textMuted, fontSize: 10 * textScale, textAlign: align }]}>{t("settings.directionNotice")}</Text>
    </ScrollView>
  </SafeAreaView>;

  function SectionTitle({ text }: { text: string }) { return <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 14 * textScale, textAlign: align }]}>{text}</Text>; }
  function Choice({ checked, icon, label, onPress }: { checked: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress(): void }) { return <Pressable accessibilityRole="radio" accessibilityState={{ checked }} onPress={onPress} style={[styles.choice, { flexDirection: rowDirection }]}><Ionicons name={icon} size={20} color={checked ? theme.primaryPressed : theme.textMuted} /><Text style={[styles.choiceText, { color: theme.text, fontSize: 13 * textScale, textAlign: align }]}>{label}</Text><Ionicons name={checked ? "radio-button-on" : "radio-button-off"} color={checked ? theme.primaryPressed : theme.textMuted} size={21} /></Pressable>; }
  function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange(value: boolean): void }) { return <View style={[styles.toggle, { flexDirection: rowDirection }]}><View style={styles.toggleCopy}><Text style={[styles.toggleLabel, { color: theme.text, fontSize: 13 * textScale, textAlign: align }]}>{label}</Text><Text style={[styles.toggleHint, { color: theme.textMuted, fontSize: 10 * textScale, textAlign: align }]}>{hint}</Text></View><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: theme.borderStrong, true: theme.primary }} thumbColor={value ? theme.surface : theme.textMuted} /></View>; }
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { alignItems: "center", borderBottomWidth: 1, gap: 12, padding: spacing.md }, back: { alignItems: "center", borderRadius: 12, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, headerCopy: { flex: 1 }, title: { fontFamily: typography.fontFamily, fontWeight: "900" }, subtitle: { fontFamily: typography.fontFamily, marginTop: 2 }, content: { padding: spacing.md, paddingBottom: 40 }, sectionTitle: { fontFamily: typography.fontFamily, fontWeight: "800", marginBottom: 8, marginTop: 16 }, card: { borderRadius: radius.lg, overflow: "hidden", paddingHorizontal: 14 }, choice: { alignItems: "center", gap: 10, minHeight: 54 }, choiceText: { flex: 1, fontFamily: typography.fontFamily, fontWeight: "700" }, grid: { flexWrap: "wrap", gap: 9 }, mode: { alignItems: "center", borderRadius: radius.md, flexBasis: "47%", flexGrow: 1, gap: 6, justifyContent: "center", minHeight: 104, padding: 10 }, modeText: { fontFamily: typography.fontFamily, fontWeight: "700", textAlign: "center" }, toggle: { alignItems: "center", gap: 10, minHeight: 70, paddingVertical: 8 }, toggleCopy: { flex: 1 }, toggleLabel: { fontFamily: typography.fontFamily, fontWeight: "800" }, toggleHint: { fontFamily: typography.fontFamily, lineHeight: 17, marginTop: 3 }, divider: { height: 1 }, preview: { alignItems: "center", borderRadius: radius.lg, flexDirection: "row", gap: 12, padding: 16 }, previewCopy: { flex: 1 }, previewTitle: { fontFamily: typography.fontFamily, fontWeight: "800" }, previewBody: { fontFamily: typography.fontFamily, lineHeight: 18, marginTop: 3 }, notice: { fontFamily: typography.fontFamily, lineHeight: 17, marginTop: 12 }
});
