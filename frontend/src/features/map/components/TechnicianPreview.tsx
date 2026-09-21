import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Technician } from "../../../domain/models/technician";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "./TechnicianPortrait";

interface TechnicianPreviewProps {
  onProfile(): void;
  onRepairRequest(): void;
  onDismiss?(): void;
  technician: Technician;
  actionLabel?: string;
  children?: ReactNode;
}
export function TechnicianPreview({ onProfile, onRepairRequest, onDismiss, technician, actionLabel = "اطلب فحصاً فورياً", children }: TechnicianPreviewProps) {
  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.avatarWrap}>
        <TechnicianPortrait technician={technician} size={46} />
        <LocalizedText style={[styles.available, !technician.isAvailable && styles.unavailable]}>{technician.isAvailable ? "متاح الآن" : "غير متاح"}</LocalizedText>
      </View>
      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <LocalizedText style={styles.name}>{technician.name}</LocalizedText>
          {technician.isPro ? <LocalizedText style={styles.pro}>♛ عَمِّرها Pro</LocalizedText> : technician.isVerified ? <Ionicons name="checkmark-circle" color={colors.primary} size={13} /> : null}
        </View>
        <LocalizedText style={styles.specialty}>{technician.specialty}</LocalizedText>
        <View style={styles.metrics}>
          <LocalizedText style={styles.rating}>{technician.ratingCount ? `★ ${technician.rating.toFixed(1)} (${technician.ratingCount} تقييم)` : "لا توجد تقييمات"} · {technician.completedJobs} عملية مكتملة</LocalizedText>
          {technician.distanceKm != null ? <LocalizedText style={styles.distance}>· يبعد {Math.round(technician.distanceKm * 1000)} متر</LocalizedText> : null}
        </View>
      </View>
      {onDismiss ? <Pressable accessibilityRole="button" accessibilityLabel="إغلاق معلومات الفني" hitSlop={10} onPress={onDismiss} style={styles.close}><Ionicons name="close" size={18} color="#A9B4BF" /></Pressable> : null}
    </View>
    {children}
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={onProfile} style={({ pressed }) => [styles.button, styles.profile, pressed && styles.pressed]}><LocalizedText style={styles.buttonText}>عرض الملف والتقييمات</LocalizedText></Pressable>
      <Pressable accessibilityRole="button" disabled={!technician.isAvailable} onPress={onRepairRequest} style={({ pressed }) => [styles.button, styles.request, pressed && styles.pressed, !technician.isAvailable && styles.disabled]}><LocalizedText style={styles.buttonText}>{actionLabel}</LocalizedText></Pressable>
    </View>
  </View>;
}
const styles = createAdaptiveStyleSheet({
  card: { ...shadows.raised, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EFE5CB", borderRadius: 22, padding: 12, gap: 12 },
  header: { direction: "ltr", flexDirection: "row-reverse", alignItems: "flex-start", gap: 8 },
  avatarWrap: { alignItems: "center", paddingTop: 2 },
  available: { backgroundColor: "#10B981", color: "white", fontSize: 8, fontWeight: "700", borderRadius: 5, marginTop: -5, paddingHorizontal: 4 },
  unavailable: { backgroundColor: "#94A3B8" },
  identity: { flex: 1 },
  nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4, flexWrap: "wrap" },
  name: { fontFamily: typography.fontFamily, color: "#334155", fontSize: 13, fontWeight: "700", writingDirection: "rtl" },
  pro: { color: "#B18A14", backgroundColor: "#FFF9DE", borderColor: "#EEDD9C", borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, fontSize: 8 },
  specialty: { fontFamily: typography.fontFamily, color: "#8290A6", fontSize: 10, lineHeight: 16, textAlign: "right", writingDirection: "rtl" },
  metrics: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, alignItems: "center" },
  rating: { fontFamily: typography.fontFamily, color: "#E6A213", fontSize: 10, fontWeight: "700", writingDirection: "rtl" },
  distance: { fontFamily: typography.fontFamily, color: "#64748B", fontSize: 9, writingDirection: "rtl" },
  close: { backgroundColor: "#F1F5F9", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  actions: { direction: "ltr", flexDirection: "row-reverse", gap: 8 },
  button: { flex: 1, minHeight: 36, borderRadius: 11, justifyContent: "center", alignItems: "center", paddingHorizontal: 5 },
  profile: { backgroundColor: "#F1F5F9" },
  request: { backgroundColor: colors.primary },
  buttonText: { color: "#26312E", fontSize: 11, fontWeight: "600", fontFamily: typography.fontFamily, textAlign: "center", writingDirection: "rtl" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 }
});
