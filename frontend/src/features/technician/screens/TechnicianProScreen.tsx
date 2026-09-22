import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { appConfig } from "../../../app/config/appConfig";
import { subscriptionApi } from "../../../services/api/subscriptionApi";
import { colors, shadows, typography, useTheme } from "../../../shared/theme";

type Props = { navigation: NativeStackNavigationProp<TechnicianStackParamList, "TechnicianPro"> };
type Feature = { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; accent: string; background: string };

const features: readonly Feature[] = [
  { icon: "flame", title: "أولوية عادلة في ظهور الطلبات", detail: "تشاهد الطلبات المناسبة لتخصصك بسرعة، ويرفع Smart Matching فرصتك عندما تكون الأنسب للحالة بدون تجاوز فني أفضل.", accent: "#BE123C", background: "#FFF1F2" },
  { icon: "sparkles", title: "AI Offer Assistant", detail: "ملخص للمشكلة والقطع المحتملة والمدة ونطاق السعر، مع رسالة عرض احترافية جاهزة للتعديل والإرسال.", accent: "#8C6D14", background: "#FFF8E3" },
  { icon: "flash", title: "تنبيهات الطلبات المستعجلة", detail: "تنبيه فوري وقوي لطلبات قريبة تناسب تخصصك عندما تفعّل استقبال الأعمال العاجلة.", accent: "#C2410C", background: "#FFF7ED" },
  { icon: "navigate-circle", title: "Smart Job Radar", detail: "يعرض عدد الطلبات ضمن نطاقك، الحالات العاجلة، والطلب صاحب أعلى فرصة قبول.", accent: "#1D4ED8", background: "#DBEAFE" },
  { icon: "bar-chart", title: "Business Analytics", detail: "أرباح الأسبوع والشهر، العروض المقبولة، متوسط المهمة، المناطق النشطة والتقييمات.", accent: "#047857", background: "#D1FAE5" },
  { icon: "bulb", title: "AI Business Coach", detail: "توصيات عملية لتحسين سعرك، توقيت عروضك، نسبة القبول، والمناطق ذات الطلب المرتفع.", accent: "#7C3AED", background: "#EDE9FE" },
  { icon: "ribbon", title: "Pro Profile + Trust Badge", detail: "واجهة أعمال أقوى تشمل شارة Pro، صور قبل وبعد، الخبرة والخدمات والمناطق والتقييمات.", accent: "#8C6D14", background: "#FFF4C8" },
  { icon: "wallet", title: "قيمة مالية أوفر", detail: "نموذج Pro مصمم ليعوض اشتراكه عبر فرص أعلى ومزايا عمولة مدروسة قبل الاعتماد النهائي.", accent: "#047857", background: "#ECFDF5" }
];

export function TechnicianProScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const [isPro, setIsPro] = useState(appConfig.demoMode);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(appConfig.demoMode);

  useEffect(() => {
    if (!appConfig.demoMode) void subscriptionApi.getMine().then((value) => setIsPro(value.isPro)).catch(() => setIsPro(false)).finally(() => setSubscriptionLoaded(true));
  }, []);

  return <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: theme.background }]}>
    <View style={styles.header}><Pressable accessibilityLabel="رجوع" onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="arrow-forward" size={18} color={theme.textMuted} /></Pressable><LocalizedText style={styles.headerTitle}>عَمِّرها Pro</LocalizedText><View style={styles.space} /></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: isDark ? theme.surfaceElevated : colors.secondary, borderColor: theme.border }]}>
        <View style={styles.crown}><Ionicons name="star" size={30} color="#FCD34D" /></View>
        <LocalizedText style={styles.heroTitle}>حوّل حسابك إلى واجهة أعمال</LocalizedText>
        <LocalizedText style={styles.heroText}>طلبات أنسب، عروض أذكى، وتنبيهات وتحليلات تساعدك تكسب شغل أكثر داخل القدس.</LocalizedText>
        <View style={styles.priceRow}><LocalizedText style={styles.price}>49</LocalizedText><View><LocalizedText style={styles.currency}>₪ / شهر</LocalizedText><LocalizedText style={styles.cancel}>السعر المقترح لخطة العرض • إلغاء بأي وقت</LocalizedText></View></View>
      </View>

      <View style={styles.active}><Ionicons name={isPro ? "checkmark-circle" : "information-circle"} size={20} color="#047857" /><View style={styles.activeCopy}><LocalizedText style={styles.activeTitle}>{!subscriptionLoaded ? "جارٍ فحص اشتراكك" : isPro ? "اشتراكك Pro فعّال" : "جاهز تنتقل إلى Pro؟"}</LocalizedText><LocalizedText style={styles.activeText}>{isPro ? "مزايا Pro مرتبطة بحسابك" : "استعرض القيمة التي تحصل عليها مع الخطة"}</LocalizedText></View><View style={styles.badge}><LocalizedText style={styles.badgeText}>{isPro ? "PRO" : "FREE"}</LocalizedText></View></View>

      <LocalizedText style={styles.sectionTitle}>لقطة من أداء حسابك</LocalizedText>
      <View style={styles.metrics}><Metric value="14" label="عرض هذا الأسبوع" /><Metric value="36%" label="نسبة القبول" /><Metric value="185 ₪" label="متوسط المهمة" /></View>

      <View style={styles.coach}><View style={styles.coachIcon}><Ionicons name="sparkles" size={20} color="#8C6D14" /></View><View style={styles.coachCopy}><LocalizedText style={styles.coachTitle}>توصية AI Business Coach</LocalizedText><LocalizedText style={styles.coachText}>أعلى طلب على تخصصك بين 4–7 مساءً. عروضك أعلى من السعر العادل بمتوسط 18%؛ تعديلها قد يرفع فرص القبول.</LocalizedText></View></View>

      <LocalizedText style={styles.sectionTitle}>كل اللي بتحصل عليه</LocalizedText>
      <View style={styles.featureList}>{features.map((feature, index) => <View key={feature.title} style={[styles.feature, index === features.length - 1 && styles.lastFeature]}><View style={[styles.featureIcon, { backgroundColor: isDark ? theme.surfaceSecondary : feature.background }]}><Ionicons name={feature.icon} size={21} color={feature.accent} /></View><View style={styles.featureCopy}><LocalizedText style={styles.featureTitle}>{feature.title}</LocalizedText><LocalizedText style={styles.featureDetail}>{feature.detail}</LocalizedText></View><Ionicons name="checkmark-circle" size={19} color={theme.success} /></View>)}</View>

      <View style={styles.assistantNote}><Ionicons name="sparkles" size={18} color={theme.primaryPressed} /><LocalizedText style={styles.assistantText}>مساعد العرض الذكي يظهر داخل شاشة إرسال العرض حتى يقرأ الطلب ويجهز اقتراحاً مرتبطاً بالحالة نفسها.</LocalizedText></View>
      <Pressable onPress={() => Alert.alert(isPro ? "عَمِّرها Pro فعّال" : "الاشتراك في Pro", isPro ? "اشتراكك مفعّل وكل المزايا المتاحة مرتبطة بحسابك." : "واجهة الدفع ستُربط بالخطة بعد اعتماد السعر ونموذج العمولة النهائي.")} style={styles.primary}><Ionicons name={isPro ? "shield-checkmark" : "star"} size={18} color="#132A24" /><LocalizedText style={styles.primaryText}>{isPro ? "اشتراكي فعّال" : "ابدأ Pro بـ 49 ₪ شهرياً"}</LocalizedText></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function Metric({ value, label }: { value: string; label: string }) { return <View style={styles.metric}><LocalizedText style={styles.metricValue}>{value}</LocalizedText><LocalizedText style={styles.metricLabel}>{label}</LocalizedText></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 62, paddingHorizontal: 12 }, back: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, headerTitle: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 16, fontWeight: "900", textAlign: "center" }, space: { width: 36 }, content: { gap: 12, padding: 14, paddingBottom: 36 }, hero: { ...shadows.raised, alignItems: "center", borderRadius: 24, borderWidth: 1, overflow: "hidden", padding: 21 }, crown: { alignItems: "center", backgroundColor: "rgba(197,155,39,0.18)", borderColor: "rgba(252,211,77,0.35)", borderRadius: 30, borderWidth: 1, height: 60, justifyContent: "center", width: 60 }, heroTitle: { color: "white", fontFamily: typography.fontFamily, fontSize: 19, fontWeight: "900", marginTop: 10, textAlign: "center" }, heroText: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 17, marginTop: 5, maxWidth: 470, textAlign: "center" }, priceRow: { alignItems: "center", flexDirection: "row-reverse", gap: 7, marginTop: 12 }, price: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 36, fontWeight: "900" }, currency: { color: "white", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, cancel: { color: "#AAB8B1", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 2, textAlign: "right" }, active: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#A7E6CD", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 8, padding: 12 }, activeCopy: { flex: 1 }, activeTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, activeText: { color: "#397564", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, badge: { backgroundColor: "#047857", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, badgeText: { color: "white", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "900" }, sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "900", marginTop: 4, textAlign: "right" }, metrics: { flexDirection: "row-reverse", gap: 8 }, metric: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 15, borderWidth: 1, flex: 1, padding: 11 }, metricValue: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "900" }, metricLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 3, textAlign: "center" }, coach: { alignItems: "flex-start", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 9, padding: 12 }, coachIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 11, height: 40, justifyContent: "center", width: 40 }, coachCopy: { flex: 1 }, coachTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, coachText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginTop: 3, textAlign: "right" }, featureList: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, overflow: "hidden", paddingHorizontal: 12 }, feature: { alignItems: "center", borderBottomColor: "#F0ECE3", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 84, paddingVertical: 10 }, lastFeature: { borderBottomWidth: 0 }, featureIcon: { alignItems: "center", borderRadius: 12, height: 44, justifyContent: "center", width: 44 }, featureCopy: { flex: 1 }, featureTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, featureDetail: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 15, marginTop: 3, textAlign: "right" }, assistantNote: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 11 }, assistantText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 15, textAlign: "right" }, primary: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 15, flexDirection: "row-reverse", gap: 7, justifyContent: "center", minHeight: 52 }, primaryText: { color: "#132A24", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "900" }
});
