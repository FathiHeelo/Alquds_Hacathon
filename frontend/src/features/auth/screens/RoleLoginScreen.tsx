import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { UserRole, type UserRole as UserRoleValue } from "../../../domain/enums/status";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { shadows, typography, useTheme } from "../../../shared/theme";

const roles: ReadonlyArray<{ role: UserRoleValue; titleKey: string; subtitleKey: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { role: UserRole.Customer, titleKey: "login.customer", subtitleKey: "login.customerHint", icon: "person" },
  { role: UserRole.Technician, titleKey: "login.technician", subtitleKey: "login.technicianHint", icon: "construct" },
  { role: UserRole.Admin, titleKey: "login.admin", subtitleKey: "login.adminHint", icon: "shield-checkmark" }
];

export function RoleLoginScreen() {
  const { switchRole } = useDemoSession();
  const { t, isRTL } = useI18n();
  const { theme, textScale, isHighContrast, reduceMotion } = useTheme();
  const direction = isRTL ? "row-reverse" : "row";
  const align = isRTL ? "right" : "left";
  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brand}><Image accessibilityLabel="AMMERHA" source={require("../../../../assets/brand/ammerha-logo.png")} style={styles.logo} /><Text style={[styles.welcome, { color: theme.text, fontSize: 23 * textScale }]}>{t("login.welcome")}</Text><Text style={[styles.tagline, { color: theme.primaryPressed, fontSize: 10 * textScale }]}>{t("login.tagline")}</Text></View>
      <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isHighContrast ? 2 : 1 }]}><Text style={[styles.title, { color: theme.text, fontSize: 17 * textScale, textAlign: align }]}>{t("login.choose")}</Text><Text style={[styles.subtitle, { color: theme.textMuted, fontSize: 9 * textScale, textAlign: align }]}>{t("login.noAuth")}</Text>
        <View style={styles.roles}>{roles.map((item) => <Pressable accessibilityHint={t(item.subtitleKey)} accessibilityLabel={t(item.titleKey)} accessibilityRole="button" key={item.role} onPress={() => switchRole(item.role)} style={({ pressed }) => [styles.role, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: isHighContrast ? 2 : 1, flexDirection: direction }, pressed && { opacity: 0.72, transform: reduceMotion ? undefined : [{ scale: 0.985 }] }]}><View style={[styles.roleIcon, { backgroundColor: theme.primarySoft }]}><Ionicons name={item.icon} size={25} color={theme.primaryPressed} /></View><View style={styles.roleCopy}><Text style={[styles.roleTitle, { color: theme.text, fontSize: 12 * textScale, textAlign: align }]}>{t(item.titleKey)}</Text><Text style={[styles.roleSubtitle, { color: theme.textMuted, fontSize: 8 * textScale, textAlign: align }]}>{t(item.subtitleKey)}</Text></View><Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={19} color={theme.textMuted} /></Pressable>)}</View>
      </View>
      <View style={[styles.safeNote, { backgroundColor: theme.primarySoft, flexDirection: direction }]}><Ionicons name="sparkles" size={15} color={theme.primaryPressed} /><Text style={[styles.safeText, { color: theme.primaryPressed, fontSize: 8 * textScale }]}>{t("login.hint")}</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { flex: 1 }, content: { flexGrow: 1, justifyContent: "center", padding: 20 }, brand: { alignItems: "center", marginBottom: 18 }, logo: { height: 150, resizeMode: "contain", width: 150 }, welcome: { fontFamily: typography.fontFamily, fontWeight: "800", marginTop: 4 }, tagline: { fontFamily: typography.fontFamily, marginTop: 3 }, panel: { ...shadows.raised, borderRadius: 24, padding: 15 }, title: { fontFamily: typography.fontFamily, fontWeight: "800" }, subtitle: { fontFamily: typography.fontFamily, marginTop: 3 }, roles: { gap: 9, marginTop: 15 }, role: { alignItems: "center", borderRadius: 16, gap: 10, minHeight: 76, padding: 11 }, pressed: { opacity: 0.72 }, roleIcon: { alignItems: "center", borderRadius: 13, height: 48, justifyContent: "center", width: 48 }, roleCopy: { flex: 1 }, roleTitle: { fontFamily: typography.fontFamily, fontWeight: "800" }, roleSubtitle: { fontFamily: typography.fontFamily, lineHeight: 14, marginTop: 3 }, safeNote: { alignItems: "center", alignSelf: "center", borderRadius: 11, gap: 5, marginTop: 14, paddingHorizontal: 11, paddingVertical: 8 }, safeText: { fontFamily: typography.fontFamily }
});
