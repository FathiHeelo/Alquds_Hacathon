import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { RepairRequestDraft } from "../../../domain/models/repairRequest";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { colors, typography } from "../../../shared/theme";
import { timeOptions, urgencyOptions } from "../requestOptions";
import { RequestMediaList } from "./RequestMediaList";

export function RequestReview({ draft }: { draft: RepairRequestDraft }) {
  const category = serviceCategories.find(({ id }) => id === draft.category)?.label ?? "غير محدد";
  const urgency = urgencyOptions.find(({ id }) => id === draft.urgency)?.label ?? "غير محدد";
  const preferredTime = timeOptions.find(({ id }) => id === draft.preferredTime)?.label ?? "غير محدد";

  return <View>
    <View style={styles.heading}>
      <View style={styles.headingIcon}><Ionicons name="clipboard" size={19} color="#8C6D14" /></View>
      <View style={styles.headingCopy}><Text style={styles.title}>ملخص طلب الصيانة</Text><Text style={styles.subtitle}>راجع البيانات قبل إرسالها للفنيين</Text></View>
      <View style={styles.ready}><Ionicons name="checkmark-circle" size={12} color="#047857" /><Text style={styles.readyText}>جاهز</Text></View>
    </View>

    <View style={styles.problemBox}>
      <Text style={styles.problemLabel}>المشكلة المسجلة</Text>
      <Text style={styles.problemText}>“{draft.description}”</Text>
      <View style={styles.categoryBadge}><Ionicons name="construct" size={12} color="#8C6D14" /><Text style={styles.categoryText}>{category}</Text></View>
    </View>

    <View style={styles.details}>
      <DetailRow icon="location" label="موقع الصيانة" value={draft.location.label} iconColor="#1D4ED8" iconBackground="#DBEAFE" />
      <DetailRow icon="flash" label="درجة الاستعجال" value={urgency} iconColor="#BE123C" iconBackground="#FFF1F2" />
      <DetailRow icon="time" label="الوقت المناسب" value={preferredTime} iconColor="#047857" iconBackground="#D1FAE5" />
      <DetailRow icon="mic" label="طريقة وصف العطل" value={draft.voice ? "تسجيل صوتي مفرغ تلقائياً" : "وصف كتابي"} iconColor="#8C6D14" iconBackground="#FFF4C8" last={!draft.media.length} />
    </View>

    {draft.media.length ? <View style={styles.mediaSection}><View style={styles.mediaHeading}><Text style={styles.mediaTitle}>المرفقات ({draft.media.length})</Text><Ionicons name="images" size={16} color="#8C6D14" /></View><RequestMediaList media={draft.media} /></View> : null}

    <View style={styles.aiNote}><View style={styles.aiIcon}><Ionicons name="sparkles" size={15} color="#8C6D14" /></View><View style={styles.aiCopy}><Text style={styles.aiTitle}>الخطوة التالية</Text><Text style={styles.aiText}>سيحلّل الذكاء الاصطناعي الطلب ويقترح السعر العادل، ثم يرسله للفنيين الأقرب.</Text></View></View>
  </View>;
}

function DetailRow({ icon, label, value, iconColor, iconBackground, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; iconColor: string; iconBackground: string; last?: boolean }) {
  return <View style={[styles.detailRow, last && styles.lastRow]}><View style={[styles.detailIcon, { backgroundColor: iconBackground }]}><Ionicons name={icon} size={16} color={iconColor} /></View><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View><Ionicons name="checkmark-circle" size={15} color="#10B981" /></View>;
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", flexDirection: "row-reverse", gap: 8 }, headingIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, headingCopy: { flex: 1 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 1, textAlign: "right" }, ready: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, readyText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" },
  problemBox: { backgroundColor: "#F8F7F4", borderColor: "#ECE7DC", borderRadius: 14, borderWidth: 1, marginTop: 13, padding: 11 }, problemLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", textAlign: "right" }, problemText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 17, marginTop: 3, textAlign: "right", writingDirection: "rtl" }, categoryBadge: { alignItems: "center", alignSelf: "flex-end", backgroundColor: "#FFF8E3", borderRadius: 9, flexDirection: "row-reverse", gap: 3, marginTop: 8, paddingHorizontal: 7, paddingVertical: 5 }, categoryText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" },
  details: { marginTop: 8 }, detailRow: { alignItems: "center", borderBottomColor: "#F0ECE3", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 8, minHeight: 57 }, lastRow: { borderBottomWidth: 0 }, detailIcon: { alignItems: "center", borderRadius: 10, height: 34, justifyContent: "center", width: 34 }, detailCopy: { flex: 1 }, detailLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, detailValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", marginTop: 2, textAlign: "right" },
  mediaSection: { borderTopColor: "#F0ECE3", borderTopWidth: 1, marginTop: 7, paddingTop: 11 }, mediaHeading: { alignItems: "center", flexDirection: "row-reverse", gap: 5, marginBottom: 8 }, mediaTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700" }, aiNote: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 8, marginTop: 12, padding: 10 }, aiIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 9, height: 32, justifyContent: "center", width: 32 }, aiCopy: { flex: 1 }, aiTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800", textAlign: "right" }, aiText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, marginTop: 2, textAlign: "right" }
});
