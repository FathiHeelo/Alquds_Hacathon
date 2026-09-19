import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { reviewRepository, technicianRepository } from "../../../services/repositories";
import type { Review } from "../../../domain/models/review";
import type { Technician } from "../../../domain/models/technician";
import { ErrorState, LoadingState } from "../../../shared/components";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";

const beforeImage = require("../../../../assets/portfolio/plumbing-before.jpg");
const afterImage = require("../../../../assets/portfolio/plumbing-after.jpg");

type Props = NativeStackScreenProps<CustomerStackParamList, "CustomerTechnicianProfile">;

export function TechnicianProfileScreen({ route, navigation }: Props) {
  const [technician, setTechnician] = useState<Technician | null>();
  const [reviews, setReviews] = useState<readonly Review[]>([]);

  useEffect(() => {
    void technicianRepository.getById(route.params.technicianId).then(setTechnician);
    void reviewRepository.getForTechnician(route.params.technicianId).then(setReviews);
  }, [route.params.technicianId]);

  if (technician === undefined) return <SafeAreaView style={styles.safe}><LoadingState /></SafeAreaView>;
  if (!technician) return <SafeAreaView style={styles.safe}><ErrorState message="تعذر العثور على ملف الفني." onRetry={() => navigation.goBack()} /></SafeAreaView>;

  const review = reviews[0];
  const requestId = route.params.requestId ?? "old_city_plumbing_leak";
  const jobId = "demo-job-offer-tariq-plumbing";

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.hero}>
      <View style={styles.heroOrb} />
      <View style={styles.heroTop}>
        <Pressable accessibilityLabel="العودة" onPress={() => navigation.goBack()} style={styles.heroButton}><Ionicons name="arrow-forward" size={18} color="white" /></Pressable>
        <View style={styles.badges}>{technician.isPro ? <View style={styles.proBadge}><Ionicons name="star" size={11} color="#FCD34D" /><LocalizedText style={styles.proText}>عَمِّرها Pro</LocalizedText></View> : null}{technician.isVerified ? <View style={styles.verifiedBadge}><Ionicons name="shield-checkmark" size={11} color="#6EE7B7" /><LocalizedText style={styles.verifiedText}>موثق بالهوية</LocalizedText></View> : null}</View>
      </View>
      <LocalizedText style={styles.memberSince}>عضوية منذ 3 سنوات • القدس</LocalizedText>
    </View>

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, styles.bioCard]}>
        <View style={styles.bioTop}>
          <View style={styles.identity}><View style={styles.portraitLift}><TechnicianPortrait technician={technician} size={68} /></View><View style={styles.identityCopy}><LocalizedText style={styles.name}>{technician.name}</LocalizedText><LocalizedText style={styles.specialty}>{technician.specialty}</LocalizedText></View></View>
          <View style={[styles.available, !technician.isAvailable && styles.unavailable]}><View style={[styles.availableDot, !technician.isAvailable && styles.unavailableDot]} /><LocalizedText style={[styles.availableText, !technician.isAvailable && styles.unavailableText]}>{technician.isAvailable ? "متاح الآن" : "غير متاح"}</LocalizedText></View>
        </View>
        <View style={styles.stats}>
          <Stat value={`★ ${technician.rating.toFixed(1)}`} label="التقييم العام" color="#D69E00" />
          <Stat value={`${technician.completedJobs}`} label="صيانة مكتملة" />
          <Stat value="99%" label="إنجاز في الوقت" color="#047857" />
          <Stat value="9 سنوات" label="خبرة بالقدس" color="#8C6D14" />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeading}><LocalizedText style={styles.sectionTitle}>معرض الأعمال الموثقة</LocalizedText><View style={styles.approved}><Ionicons name="checkmark-circle" size={12} color="#8C6D14" /><LocalizedText style={styles.approvedText}>فحص معتمد</LocalizedText></View></View>
        <LocalizedText style={styles.sectionSubtitle}>قبل وبعد الصيانة</LocalizedText>
        <View style={styles.gallery}>
          <View style={[styles.photoWrap, styles.beforeWrap]}><Image source={beforeImage} style={styles.photo} /><View style={[styles.photoLabel, styles.beforeLabel]}><LocalizedText style={styles.photoLabelText}>قبل: تسريب وصدأ</LocalizedText></View></View>
          <View style={[styles.photoWrap, styles.afterWrap]}><Image source={afterImage} style={styles.photo} /><View style={[styles.photoLabel, styles.afterLabel]}><LocalizedText style={styles.photoLabelText}>بعد: عزل وإصلاح متقن</LocalizedText></View></View>
        </View>
        <LocalizedText style={styles.galleryCaption}>توثيق صيانة حقيقية تم تنفيذها الأسبوع الماضي في حارة السعدية بالبلدة القديمة.</LocalizedText>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeading}><LocalizedText style={styles.sectionTitle}>آراء أهل القدس</LocalizedText><LocalizedText style={styles.allReviews}>{reviews.length || 154} تقييم موثق</LocalizedText></View>
        <View style={styles.reviewCard}>
          <View style={styles.reviewTop}><View><LocalizedText style={styles.reviewer}>خليل السلايمة</LocalizedText><LocalizedText style={styles.reviewerArea}>واد الجوز</LocalizedText></View><LocalizedText style={styles.stars}>★★★★★</LocalizedText></View>
          <LocalizedText style={styles.reviewText}>“{review?.comment ?? "ملتزم بالوقت، محترم جداً وما غلّى بالسعر أبداً. فني ابن بلد يعتمد عليه."}”</LocalizedText>
          <View style={styles.reviewVerified}><Ionicons name="checkmark-circle" size={11} color="#047857" /><LocalizedText style={styles.reviewVerifiedText}>صيانة موثقة عبر عَمِّرها</LocalizedText></View>
        </View>
      </View>
    </ScrollView>

    <View style={styles.footer}>
      <Pressable accessibilityLabel="مراسلة الفني" onPress={() => navigation.navigate("CustomerChat", { jobId, requestId, technicianId: technician.id })} style={styles.chatButton}><Ionicons name="chatbubble-ellipses" size={20} color={colors.text} /></Pressable>
      <Pressable disabled={!technician.isAvailable} onPress={() => navigation.navigate("CustomerRepairRequest", { technicianId: technician.id })} style={({ pressed }) => [styles.requestButton, !technician.isAvailable && styles.disabled, pressed && styles.pressed]}><Ionicons name="construct" size={18} color={colors.text} /><LocalizedText style={styles.requestText}>طلب صيانة مع {technician.name.split(" ")[0]}</LocalizedText></Pressable>
    </View>
  </SafeAreaView>;
}

function Stat({ value, label, color = colors.text }: { value: string; label: string; color?: string }) {
  return <View style={styles.stat}><LocalizedText style={[styles.statValue, { color }]}>{value}</LocalizedText><LocalizedText style={styles.statLabel}>{label}</LocalizedText></View>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, hero: { backgroundColor: colors.secondary, height: 156, justifyContent: "space-between", overflow: "hidden", padding: 13 }, heroOrb: { backgroundColor: "rgba(197,155,39,0.12)", borderRadius: 130, height: 260, left: -70, position: "absolute", top: -90, width: 260 }, heroTop: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, heroButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, badges: { flexDirection: "row-reverse", gap: 6 }, proBadge: { alignItems: "center", backgroundColor: "rgba(245,158,11,0.18)", borderColor: "rgba(252,211,77,0.55)", borderRadius: 10, borderWidth: 1, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 8, paddingVertical: 5 }, proText: { color: "#FCD34D", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "800" }, verifiedBadge: { alignItems: "center", backgroundColor: "rgba(16,185,129,0.16)", borderColor: "rgba(110,231,183,0.5)", borderRadius: 10, borderWidth: 1, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 8, paddingVertical: 5 }, verifiedText: { color: "#6EE7B7", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "800" }, memberSince: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 9, marginBottom: 21, textAlign: "right" },
  content: { gap: 12, padding: 14, paddingBottom: 24 }, card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 19, borderWidth: 1, padding: 13 }, bioCard: { marginTop: -38 }, bioTop: { alignItems: "flex-start", flexDirection: "row-reverse", justifyContent: "space-between" }, identity: { alignItems: "center", flex: 1, flexDirection: "row-reverse", gap: 10 }, portraitLift: { marginTop: -31 }, identityCopy: { flex: 1 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800", textAlign: "right" }, specialty: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, textAlign: "right" }, available: { alignItems: "center", backgroundColor: "#D1FAE5", borderRadius: 10, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, availableDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, availableText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, unavailable: { backgroundColor: "#F1F5F9" }, unavailableDot: { backgroundColor: "#94A3B8" }, unavailableText: { color: "#64748B" }, stats: { borderTopColor: "#F0ECE3", borderTopWidth: 1, flexDirection: "row-reverse", marginTop: 12, paddingTop: 12 }, stat: { alignItems: "center", flex: 1 }, statValue: { fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, statLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 2, textAlign: "center" },
  sectionHeading: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, sectionSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginBottom: 9, marginTop: 1, textAlign: "right" }, approved: { alignItems: "center", flexDirection: "row-reverse", gap: 3 }, approvedText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, gallery: { flexDirection: "row-reverse", gap: 8 }, photoWrap: { borderRadius: 12, borderWidth: 1, flex: 1, height: 116, overflow: "hidden" }, beforeWrap: { borderColor: "#FECDD3" }, afterWrap: { borderColor: "#A7F3D0" }, photo: { height: "100%", width: "100%" }, photoLabel: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 3, position: "absolute", right: 5, top: 5 }, beforeLabel: { backgroundColor: "#BE123C" }, afterLabel: { backgroundColor: "#059669" }, photoLabelText: { color: "white", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }, galleryCaption: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, marginTop: 8, textAlign: "right" },
  allReviews: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, reviewCard: { backgroundColor: "#FAFAF9", borderRadius: 13, marginTop: 9, padding: 10 }, reviewTop: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, reviewer: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", textAlign: "right" }, reviewerArea: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, stars: { color: "#F59E0B", fontSize: 11 }, reviewText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginTop: 7, textAlign: "right", writingDirection: "rtl" }, reviewVerified: { alignItems: "center", flexDirection: "row-reverse", gap: 3, marginTop: 7 }, reviewVerifiedText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "600" },
  footer: { backgroundColor: "white", borderTopColor: "#ECE7DC", borderTopWidth: 1, flexDirection: "row", gap: 8, padding: 11 }, chatButton: { alignItems: "center", backgroundColor: "white", borderColor: "#D6D3D1", borderRadius: 14, borderWidth: 1, height: 48, justifyContent: "center", width: 48 }, requestButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 14, flex: 1, flexDirection: "row-reverse", gap: 6, justifyContent: "center" }, requestText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] }
});
