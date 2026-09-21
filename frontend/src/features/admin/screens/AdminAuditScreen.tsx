import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AdminStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { auditEntries } from "../adminData";
import { AdminHeader } from "../components/AdminHeader";

export function AdminAuditScreen({ navigation }: NativeStackScreenProps<AdminStackParamList, "AdminAudit">) {
  const entries = auditEntries;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><AdminHeader title="سجل الرقابة" subtitle="سجل قرارات الإدارة" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.info}><Ionicons name="shield-checkmark" size={19} color="#176B51" /><LocalizedText style={styles.infoText}>سجل عرض منظم لقرارات الرقابة الخاصة بمنصة القدس.</LocalizedText></View>
    {entries.length ? <View style={styles.card}>{entries.map((entry, index) => <Pressable key={`${entry.action}-${entry.time}`} onPress={() => Alert.alert(entry.action, `${entry.actor}\n${entry.target}\n${entry.time}`)} style={({ pressed }) => [styles.entry, index === entries.length - 1 && styles.last, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${entry.color}18` }]}><Ionicons name="document-text" size={17} color={entry.color} /></View><View style={styles.copy}><LocalizedText style={styles.action}>{entry.action}</LocalizedText><LocalizedText style={styles.meta}>{entry.actor} • {entry.target}</LocalizedText><LocalizedText style={styles.time}>{entry.time}</LocalizedText></View><Ionicons name="chevron-back" size={15} color="#94A3B8" /></Pressable>)}</View> : <View style={styles.card}><LocalizedText style={styles.meta}>لا توجد سجلات متاحة.</LocalizedText></View>}
  </ScrollView></SafeAreaView>;
}
const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, content: { gap: 11, padding: 14, paddingBottom: 30 }, info: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#A7E6CD", borderRadius: 15, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 11 }, infoText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }, card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, overflow: "hidden", paddingHorizontal: 11 }, entry: { alignItems: "center", borderBottomColor: "#F0ECE3", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 76 }, last: { borderBottomWidth: 0 }, pressed: { backgroundColor: "#FAFAF9" }, icon: { alignItems: "center", borderRadius: 10, height: 37, justifyContent: "center", width: 37 }, copy: { flex: 1 }, action: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "800", textAlign: "right" }, meta: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3, textAlign: "right" }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 3, textAlign: "right" }, export: { alignItems: "center", borderColor: "#EEDB9D", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 6, justifyContent: "center", minHeight: 47 }, exportText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" }
});
