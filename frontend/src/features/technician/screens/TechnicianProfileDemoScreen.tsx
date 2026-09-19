import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";

type Props = { navigation: NativeStackNavigationProp<TechnicianStackParamList, "TechnicianProfile"> };

export function TechnicianProfileDemoScreen({ navigation }: Props) {
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable><LocalizedText style={styles.headerTitle}>ملفي المهني</LocalizedText><Pressable onPress={() => Alert.alert("تعديل الملف", "تم فتح نموذج تعديل البيانات المهنية.")} style={styles.edit}><Ionicons name="create-outline" size={18} color="#8C6D14" /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}><View style={styles.glow} /><Image source={require("../../../../assets/technicians/tech-tariq-maqdisi.jpg")} style={styles.avatar} /><View style={styles.heroCopy}><View style={styles.nameRow}><LocalizedText style={styles.name}>طارق المقدسي</LocalizedText><Ionicons name="checkmark-circle" size={16} color="#6EE7B7" /></View><LocalizedText style={styles.role}>فني سباكة وصحية • البلدة القديمة</LocalizedText><View style={styles.badges}><View style={styles.proBadge}><Ionicons name="star" size={10} color="#FCD34D" /><LocalizedText style={styles.proText}>AMMERHA Pro</LocalizedText></View><View style={styles.available}><LocalizedText style={styles.availableText}>متاح الآن</LocalizedText></View></View></View></View>
      <View style={styles.stats}><Stat icon="star" value="4.9" label="التقييم" /><Stat icon="checkmark-done" value="154" label="عمل مكتمل" /><Stat icon="time" value="8 د" label="سرعة الرد" /></View>
      <View style={styles.card}><View style={styles.cardTitleRow}><Ionicons name="person" size={17} color="#8C6D14" /><LocalizedText style={styles.cardTitle}>نبذة عني</LocalizedText></View><LocalizedText style={styles.bio}>فني سباكة معتمد بخبرة 9 سنوات في بيوت القدس، متخصص في كشف التسريبات وصيانة المطابخ والحمامات بسرعة ونظافة.</LocalizedText></View>
      <View style={styles.card}><View style={styles.cardTitleRow}><Ionicons name="construct" size={17} color="#8C6D14" /><LocalizedText style={styles.cardTitle}>الخدمات</LocalizedText></View><View style={styles.chips}><Chip text="كشف التسريبات" /><Chip text="صيانة المجالي" /><Chip text="مضخات المياه" /><Chip text="تمديدات صحية" /></View></View>
      <View style={styles.card}><View style={styles.cardTitleRow}><Ionicons name="images" size={17} color="#8C6D14" /><LocalizedText style={styles.cardTitle}>أعمال قبل وبعد</LocalizedText></View><View style={styles.portfolio}><View style={styles.photoWrap}><Image source={require("../../../../assets/portfolio/plumbing-before.jpg")} style={styles.photo} /><LocalizedText style={styles.photoLabel}>قبل</LocalizedText></View><View style={styles.photoWrap}><Image source={require("../../../../assets/portfolio/plumbing-after.jpg")} style={styles.photo} /><LocalizedText style={[styles.photoLabel, styles.afterLabel]}>بعد</LocalizedText></View></View></View>
      <Pressable onPress={() => navigation.navigate("TechnicianAccountDetail", { section: "services" })} style={styles.primary}><Ionicons name="create" size={17} color={colors.text} /><LocalizedText style={styles.primaryText}>تعديل الملف والخدمات</LocalizedText></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) { return <View style={styles.stat}><Ionicons name={icon} size={15} color="#C59B27" /><LocalizedText style={styles.statValue}>{value}</LocalizedText><LocalizedText style={styles.statLabel}>{label}</LocalizedText></View>; }
function Chip({ text }: { text: string }) { return <View style={styles.chip}><Ionicons name="checkmark" size={11} color="#047857" /><LocalizedText style={styles.chipText}>{text}</LocalizedText></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 62, paddingHorizontal: 12 },
  back: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  headerTitle: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800", textAlign: "center" },
  edit: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  content: { gap: 11, padding: 14, paddingBottom: 30 },
  hero: { ...shadows.raised, alignItems: "center", backgroundColor: colors.secondary, borderRadius: 22, flexDirection: "row-reverse", gap: 12, overflow: "hidden", padding: 15 },
  glow: { backgroundColor: "rgba(197,155,39,0.15)", borderRadius: 100, height: 190, left: -40, position: "absolute", top: -60, width: 190 },
  avatar: { borderColor: colors.primary, borderRadius: 36, borderWidth: 2, height: 72, width: 72 },
  heroCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, name: { color: "white", fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "800" }, role: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 9, marginTop: 3, textAlign: "right" }, badges: { flexDirection: "row-reverse", gap: 6, marginTop: 8 }, proBadge: { alignItems: "center", backgroundColor: "rgba(197,155,39,0.2)", borderRadius: 8, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 4 }, proText: { color: "#FCD34D", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }, available: { backgroundColor: "rgba(16,185,129,0.18)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 }, availableText: { color: "#6EE7B7", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" },
  stats: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", paddingVertical: 11 }, stat: { alignItems: "center", flex: 1 }, statValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", marginTop: 2 }, statLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 1 },
  card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, padding: 12 }, cardTitleRow: { alignItems: "center", flexDirection: "row-reverse", gap: 6 }, cardTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, bio: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 18, marginTop: 8, textAlign: "right", writingDirection: "rtl" }, chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, marginTop: 9 }, chip: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 8, paddingVertical: 6 }, chipText: { color: "#176B51", fontFamily: typography.fontFamily, fontSize: 8 }, portfolio: { flexDirection: "row-reverse", gap: 8, marginTop: 9 }, photoWrap: { borderRadius: 12, flex: 1, height: 116, overflow: "hidden" }, photo: { height: "100%", width: "100%" }, photoLabel: { backgroundColor: "rgba(19,42,36,0.82)", borderRadius: 7, color: "white", fontFamily: typography.fontFamily, fontSize: 7, paddingHorizontal: 7, paddingVertical: 4, position: "absolute", right: 6, top: 6 }, afterLabel: { backgroundColor: "rgba(4,120,87,0.9)" }, primary: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 14, flexDirection: "row-reverse", gap: 6, justifyContent: "center", minHeight: 49 }, primaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "800" }
});
