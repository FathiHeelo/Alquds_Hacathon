import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { colors, typography } from "../../../shared/theme";

export function AdminHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const { logout } = useDemoSession();
  return <View style={styles.header}>
    {onBack ? <Pressable accessibilityLabel="رجوع" onPress={onBack} style={styles.icon}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable> : <View style={styles.brandIcon}><Ionicons name="shield-checkmark" size={18} color="white" /></View>}
    <View style={styles.copy}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>
    <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={14} color="#BE123C" /><Text style={styles.logoutText}>خروج</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 66, paddingHorizontal: 12 }, brandIcon: { alignItems: "center", backgroundColor: "#BE123C", borderRadius: 10, height: 36, justifyContent: "center", width: 36 }, icon: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 10, height: 36, justifyContent: "center", width: 36 }, copy: { flex: 1 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 2, textAlign: "right" }, logout: { alignItems: "center", backgroundColor: "#FFF1F2", borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 8, paddingVertical: 7 }, logoutText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }
});
