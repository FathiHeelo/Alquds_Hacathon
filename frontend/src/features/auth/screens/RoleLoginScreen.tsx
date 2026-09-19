import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { UserRole, type UserRole as UserRoleValue } from "../../../domain/enums/status";
import { colors, shadows, typography } from "../../../shared/theme";

const roles: ReadonlyArray<{ role: UserRoleValue; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = [
  { role: UserRole.Customer, title: "الدخول كعميل", subtitle: "اطلب صيانة وتابع الفني والعروض", icon: "person", color: "#8C6D14", background: "#FFF4C8" },
  { role: UserRole.Technician, title: "الدخول كفني", subtitle: "شاهد الطلبات وأعمالك ورسائلك", icon: "construct", color: "#047857", background: "#D1FAE5" },
  { role: UserRole.Admin, title: "الدخول للإدارة", subtitle: "راقب المنصة والتوثيق والمخاطر", icon: "shield-checkmark", color: "#BE123C", background: "#FFF1F2" }
];

export function RoleLoginScreen() {
  const { switchRole } = useDemoSession();
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brand}><Image source={require("../../../../assets/brand/ammerha-logo.png")} style={styles.logo} /><Text style={styles.welcome}>أهلاً بك في عَمِّرها</Text><Text style={styles.tagline}>من قلب القدس نبنيها بأيدينا</Text></View>
      <View style={styles.panel}><Text style={styles.title}>اختر طريقة الدخول</Text><Text style={styles.subtitle}>نسخة العرض لا تحتاج كلمة مرور أو إنشاء حساب</Text>
        <View style={styles.roles}>{roles.map((item) => <Pressable accessibilityRole="button" key={item.role} onPress={() => switchRole(item.role)} style={({ pressed }) => [styles.role, pressed && styles.pressed]}><View style={[styles.roleIcon, { backgroundColor: item.background }]}><Ionicons name={item.icon} size={25} color={item.color} /></View><View style={styles.roleCopy}><Text style={styles.roleTitle}>{item.title}</Text><Text style={styles.roleSubtitle}>{item.subtitle}</Text></View><Ionicons name="arrow-back" size={19} color="#94A3B8" /></Pressable>)}</View>
      </View>
      <View style={styles.safeNote}><Ionicons name="sparkles" size={15} color="#8C6D14" /><Text style={styles.safeText}>اختر أي دور لتجربة صفحاته مباشرة.</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, content: { flexGrow: 1, justifyContent: "center", padding: 20 }, brand: { alignItems: "center", marginBottom: 18 }, logo: { height: 150, resizeMode: "contain", width: 150 }, welcome: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 23, fontWeight: "800", marginTop: 4 }, tagline: { color: "#A17A16", fontFamily: typography.fontFamily, fontSize: 10, marginTop: 3 }, panel: { ...shadows.raised, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 24, borderWidth: 1, padding: 15 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, marginTop: 3, textAlign: "right" }, roles: { gap: 9, marginTop: 15 }, role: { alignItems: "center", backgroundColor: "#FBFBFA", borderColor: "#ECE7DC", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 76, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, roleIcon: { alignItems: "center", borderRadius: 13, height: 48, justifyContent: "center", width: 48 }, roleCopy: { flex: 1 }, roleTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, roleSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, marginTop: 3, textAlign: "right" }, safeNote: { alignItems: "center", alignSelf: "center", backgroundColor: "#FFF8E3", borderRadius: 11, flexDirection: "row-reverse", gap: 5, marginTop: 14, paddingHorizontal: 11, paddingVertical: 8 }, safeText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8 }
});
