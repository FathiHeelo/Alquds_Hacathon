import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { analyzeTechnicianVoice, type TechnicianVoiceOfferResult } from "../../../services/ai/technicianVoiceOfferAdapter";
import { colors, shadows, typography } from "../../../shared/theme";
import type { TechnicianRequestItem } from "../technicianData";

type VoiceState = "idle" | "listening" | "analyzing" | "ready" | "error";

export function PalestinianVoiceOfferCard({ request, onResult }: { request: TechnicianRequestItem; onResult(result: TechnicianVoiceOfferResult): void }) {
  const [status, setStatus] = useState<VoiceState>("idle");
  const [result, setResult] = useState<TechnicianVoiceOfferResult>();
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const record = async () => {
    setResult(undefined); setStatus("listening");
    await new Promise((resolve) => setTimeout(resolve, 1600));
    if (!mounted.current) return;
    setStatus("analyzing");
    try {
      const generated = await analyzeTechnicianVoice(request);
      if (!mounted.current) return;
      setResult(generated); setStatus("ready"); onResult(generated);
    } catch {
      if (mounted.current) setStatus("error");
    }
  };

  const busy = status === "listening" || status === "analyzing";
  return <View style={styles.card}>
    <View style={styles.top}><View style={styles.brand}><View style={styles.aiIcon}><Ionicons name="mic" size={17} color={colors.text} /></View><View><Text style={styles.title}>الصوت المقدسي الذكي</Text><Text style={styles.subtitle}>احكيها بلهجتك، وإحنا بنرتّب عرضك باحتراف</Text></View></View><View style={[styles.status, busy && styles.busyStatus, status === "ready" && styles.readyStatus]}><View style={[styles.statusDot, busy && styles.busyDot, status === "ready" && styles.readyDot]} /><Text style={[styles.statusText, busy && styles.busyText, status === "ready" && styles.readyText]}>{status === "listening" ? "يسمعك الآن" : status === "analyzing" ? "يحلّل الحكي" : status === "ready" ? "العرض جاهز" : "جاهز"}</Text></View></View>
    <View style={[styles.voiceBox, busy && styles.activeVoice]}>
      <View style={styles.wave}>{[14, 26, 38, 22, 34, 18, 42, 28, 16, 32, 20].map((height, index) => <View key={index} style={[styles.waveBar, { height: busy ? height : Math.max(7, height / 3) }, busy && styles.activeBar]} />)}</View>
      {status === "idle" ? <Text style={styles.hint}>اضغط على المايك واحكي للعميل شو فهمت، متى بتوصل، وكم بدك وقت.</Text> : null}
      {status === "listening" ? <Text style={styles.listening}>احكي الآن… الصوت المقدسي الذكي سامعك</Text> : null}
      {status === "analyzing" ? <Text style={styles.analyzing}>بنرتّب حكيك ونحوّله لعرض واضح ومحترف…</Text> : null}
      {status === "error" ? <Text style={styles.error}>تعذر تحليل التسجيل. جرّب مرة ثانية.</Text> : null}
      {result ? <View style={styles.transcript}><View style={styles.transcriptHead}><Ionicons name="checkmark-circle" size={14} color="#047857" /><Text style={styles.transcriptLabel}>فهمنا من حكيك</Text></View><Text style={styles.transcriptText}>“{result.transcript}”</Text><View style={styles.offer}><Text style={styles.offerLabel}>الرسالة الناتجة</Text><Text style={styles.offerText}>{result.suggestedMessage}</Text></View></View> : null}
    </View>
    <Pressable disabled={busy} onPress={() => void record()} style={({ pressed }) => [styles.record, busy && styles.disabled, pressed && styles.pressed]}><View style={[styles.micCircle, status === "listening" && styles.recording]}><Ionicons name={status === "ready" ? "refresh" : "mic"} size={18} color="white" /></View><Text style={styles.recordText}>{status === "ready" ? "إعادة التسجيل" : busy ? status === "listening" ? "جارٍ الاستماع…" : "جارٍ إنشاء العرض…" : "ابدأ الحكي"}</Text></Pressable>
    {result ? <View style={styles.applied}><Ionicons name="sparkles" size={14} color="#8C6D14" /><Text style={styles.appliedText}>تم اعتماد الرسالة والسعر المقترح في العرض بالأسفل.</Text></View> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { ...shadows.raised, backgroundColor: "#FFFDF7", borderColor: "#E5C86E", borderRadius: 19, borderWidth: 1, padding: 12 }, top: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, brand: { alignItems: "center", flexDirection: "row-reverse", gap: 7 }, aiIcon: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, height: 34, justifyContent: "center", width: 34 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "900", textAlign: "right" }, subtitle: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 2, textAlign: "right" }, status: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 9, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 7, paddingVertical: 5 }, busyStatus: { backgroundColor: "#FFF1F2" }, readyStatus: { backgroundColor: "#ECFDF5" }, statusDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, busyDot: { backgroundColor: "#E11D48" }, readyDot: { backgroundColor: "#10B981" }, statusText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }, busyText: { color: "#BE123C" }, readyText: { color: "#047857" }, voiceBox: { alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 14, borderWidth: 1, marginTop: 10, padding: 10 }, activeVoice: { borderColor: "#E5C86E", borderWidth: 2 }, wave: { alignItems: "center", flexDirection: "row", gap: 4, height: 45, justifyContent: "center" }, waveBar: { backgroundColor: "#D8CBAA", borderRadius: 3, width: 3 }, activeBar: { backgroundColor: colors.primary }, hint: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "center" }, listening: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" }, analyzing: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" }, error: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 8 }, transcript: { alignSelf: "stretch", marginTop: 5 }, transcriptHead: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, transcriptLabel: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, transcriptText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginTop: 5, textAlign: "right", writingDirection: "rtl" }, offer: { backgroundColor: "#FFF8E3", borderRadius: 10, marginTop: 8, padding: 8 }, offerLabel: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700", textAlign: "right" }, offerText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginTop: 3, textAlign: "right", writingDirection: "rtl" }, record: { alignItems: "center", alignSelf: "center", flexDirection: "row-reverse", gap: 7, marginTop: 10 }, micCircle: { alignItems: "center", backgroundColor: "#BE123C", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, recording: { backgroundColor: "#E11D48" }, recordText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800" }, disabled: { opacity: 0.65 }, pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] }, applied: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 10, flexDirection: "row-reverse", gap: 5, marginTop: 9, padding: 8 }, appliedText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }
});
