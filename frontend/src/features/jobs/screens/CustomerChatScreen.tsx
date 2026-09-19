import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { customerChatRepository as chatRepository, customerJobRepository, technicianRepository } from "../../../services/repositories";
import type { ChatMessage } from "../../../domain/contracts/chatRepository";
import type { Technician } from "../../../domain/models/technician";
import type { Job } from "../../../domain/models/job";
import { ErrorState, LoadingState } from "../../../shared/components";
import { colors, shadows, typography } from "../../../shared/theme";

const jobStatusLabel: Record<Job["status"], string> = { accepted: "تم قبول الطلب", scheduled: "موعد محجوز", on_the_way: "الفني في الطريق", in_progress: "العمل جارٍ", completed: "اكتمل العمل", cancelled: "الطلب ملغي" };

export function CustomerChatScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerChat">) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(true);
  const [technician, setTechnician] = useState<Technician>();
  const [job, setJob] = useState<Job>();
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([chatRepository.getMessages(route.params.jobId), technicianRepository.getById(route.params.technicianId), customerJobRepository.getJob(route.params.jobId)]).then(([loaded, profile, currentJob]) => { if (active) { setMessages(loaded); setTechnician(profile ?? undefined); setJob(currentJob); } }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.jobId]);

  const send = async (value: string) => {
    if (!value.trim()) return;
    try {
      const message = await chatRepository.send(route.params.jobId, value.trim());
      setMessages((current) => [...current, message]);
      setText("");
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch {
      setError(true);
    }
  };

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="العودة إلى الرسائل" onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable>
        <View style={styles.person}><View style={styles.portrait}><View style={styles.avatar}><Ionicons name="person" size={21} color={colors.primary} /></View></View><View><View style={styles.nameRow}><LocalizedText style={styles.name}>{technician?.name ?? "الفني"}</LocalizedText>{technician?.isPro ? <LocalizedText style={styles.pro}>Pro</LocalizedText> : null}</View><LocalizedText style={styles.status}>{job ? jobStatusLabel[job.status] : ""}</LocalizedText></View></View>
        <Pressable accessibilityLabel="مركز الأمان" onPress={() => setSafetyVisible(!safetyVisible)} style={styles.headerButton}><Ionicons name="shield-checkmark" size={18} color={colors.primaryPressed} /></Pressable>
      </View>
      {safetyVisible ? <View style={styles.safety}><Ionicons name="lock-closed" size={13} color="#8C6D14" /><LocalizedText style={styles.safetyText}>لأمانك وضمان حقوقك، تتم جميع الاتفاقات عبر عَمِّرها دون مشاركة أرقام الهواتف.</LocalizedText></View> : null}
      {loading ? <LoadingState /> : error ? <ErrorState message="تعذر تحميل المحادثة." /> : <ScrollView ref={listRef} contentContainerStyle={styles.stream} keyboardShouldPersistTaps="handled" onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}>
        {messages.length ? <View style={styles.day}><LocalizedText style={styles.dayText}>المحادثة</LocalizedText></View> : <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={30} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>لا توجد رسائل بعد. ابدأ المحادثة برسالة.</LocalizedText></View>}
        {messages.map((message) => <View key={message.id} style={[styles.bubble, message.sender === "customer" ? styles.outgoing : styles.incoming]}>
          <LocalizedText style={styles.message}>{message.text}</LocalizedText><LocalizedText style={styles.time}>{message.createdAt}</LocalizedText>
        </View>)}
      </ScrollView>}
      <View style={styles.inputBar}>
        <LocalizedTextInput multiline value={text} onChangeText={setText} placeholder={`اكتب رسالتك لـ ${(technician?.name ?? "الفني").split(" ")[0]}...`} placeholderTextColor="#94A3B8" style={styles.input} />
        <Pressable accessibilityLabel="إرسال الرسالة" disabled={!text.trim()} onPress={() => void send(text)} style={({ pressed }) => [styles.send, !text.trim() && styles.sendDisabled, pressed && styles.pressed]}><Ionicons name="send" size={17} color={colors.text} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#E7E2D8", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 62, paddingHorizontal: 12 },
  headerButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 16, height: 34, justifyContent: "center", width: 34 },
  person: { alignItems: "center", flex: 1, flexDirection: "row-reverse", gap: 8 }, portrait: { position: "relative" }, avatar: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, online: { backgroundColor: "#10B981", borderColor: "white", borderRadius: 5, borderWidth: 1.5, bottom: -1, height: 10, position: "absolute", right: -1, width: 10 },
  nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "700" }, pro: { backgroundColor: "#FFF4C8", borderRadius: 4, color: "#8C6D14", fontSize: 8, fontWeight: "800", paddingHorizontal: 4 }, status: { color: "#059669", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" },
  safety: { alignItems: "center", backgroundColor: "#FFF8E3", borderBottomColor: "#EEDB9D", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 6, paddingHorizontal: 12, paddingVertical: 7 }, safetyText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, textAlign: "right", writingDirection: "rtl" },
  stream: { flexGrow: 1, gap: 10, padding: 12, paddingBottom: 20 }, day: { alignSelf: "center", backgroundColor: "#E7E5E4", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 }, dayText: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 8 }, empty: { alignItems: "center", gap: 7, paddingVertical: 28 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "center" },
  bubble: { ...shadows.subtle, borderRadius: 16, maxWidth: "85%", paddingHorizontal: 11, paddingVertical: 9 }, incoming: { alignSelf: "flex-end", backgroundColor: "white", borderColor: "#E7E2D8", borderTopRightRadius: 4, borderWidth: 1 }, outgoing: { alignSelf: "flex-start", backgroundColor: colors.primary, borderTopLeftRadius: 4 }, message: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 20, textAlign: "right", writingDirection: "rtl" }, time: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "left" },
  location: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: 10, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 7 }, locationIcon: { alignItems: "center", backgroundColor: "#DBEAFE", borderRadius: 9, height: 30, justifyContent: "center", width: 30 }, locationTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", textAlign: "right" }, locationText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" },
  inputBar: { alignItems: "flex-end", backgroundColor: "white", borderTopColor: "#E7E2D8", borderTopWidth: 1, flexDirection: "row", gap: 6, padding: 9 }, attach: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, input: { backgroundColor: "#FAFAF9", borderColor: "#E7E2D8", borderRadius: 12, borderWidth: 1, color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 11, maxHeight: 90, minHeight: 36, paddingHorizontal: 10, paddingVertical: 7, textAlign: "right", writingDirection: "rtl" }, send: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, sendDisabled: { opacity: 0.42 }, pressed: { opacity: 0.7, transform: [{ scale: 0.93 }] }
});
