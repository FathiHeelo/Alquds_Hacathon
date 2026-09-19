import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { chatRepository } from "../../../demo/adapters/demoChatRepository";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import type { ChatMessage } from "../../../domain/contracts/chatRepository";
import { ErrorState, LoadingState } from "../../../shared/components";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";

export function CustomerChatScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerChat">) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(true);
  const listRef = useRef<ScrollView>(null);
  const technician = demoTechnicians.find(({ id }) => id === route.params.technicianId) ?? demoTechnicians[0];

  useEffect(() => {
    chatRepository.getMessages(route.params.jobId).then(setMessages).catch(() => setError(true)).finally(() => setLoading(false));
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
        <View style={styles.person}><View style={styles.portrait}><TechnicianPortrait technician={technician} size={40} /><View style={styles.online} /></View><View><View style={styles.nameRow}><LocalizedText style={styles.name}>{technician.name}</LocalizedText>{technician.isPro ? <LocalizedText style={styles.pro}>Pro</LocalizedText> : null}</View><LocalizedText style={styles.status}>في الطريق • وصول 5 دقائق</LocalizedText></View></View>
        <Pressable accessibilityLabel="مركز الأمان" onPress={() => setSafetyVisible(!safetyVisible)} style={styles.headerButton}><Ionicons name="shield-checkmark" size={18} color={colors.primaryPressed} /></Pressable>
      </View>
      {safetyVisible ? <View style={styles.safety}><Ionicons name="lock-closed" size={13} color="#8C6D14" /><LocalizedText style={styles.safetyText}>لأمانك وضمان حقوقك، تتم جميع الاتفاقات عبر عَمِّرها دون مشاركة أرقام الهواتف.</LocalizedText></View> : null}
      {loading ? <LoadingState /> : error ? <ErrorState message="تعذر تحميل المحادثة." /> : <ScrollView ref={listRef} contentContainerStyle={styles.stream} keyboardShouldPersistTaps="handled" onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}>
        <View style={styles.day}><LocalizedText style={styles.dayText}>اليوم • 10:15 ص</LocalizedText></View>
        {messages.map((message) => <View key={message.id} style={[styles.bubble, message.sender === "customer" ? styles.outgoing : styles.incoming]}>
          <LocalizedText style={styles.message}>{message.text}</LocalizedText><LocalizedText style={styles.time}>{message.createdAt}</LocalizedText>
        </View>)}
        <View style={[styles.bubble, styles.incoming]}>
          <View style={styles.location}><View style={styles.locationIcon}><Ionicons name="location" size={17} color="#2563EB" /></View><View><LocalizedText style={styles.locationTitle}>موقع الفني المباشر</LocalizedText><LocalizedText style={styles.locationText}>شارع عقبة الخالدية، على بعد 90 متر</LocalizedText></View></View>
          <LocalizedText style={styles.time}>10:18 ص</LocalizedText>
        </View>
      </ScrollView>}
      <View style={styles.inputBar}>
        <Pressable accessibilityLabel="إرفاق صورة" onPress={() => void send("📷 صورة مرفقة من موقع الصيانة")} style={styles.attach}><Ionicons name="camera" size={18} color="#64748B" /></Pressable>
        <Pressable accessibilityLabel="مشاركة الموقع" onPress={() => void send("📍 مشاركة الموقع: البلدة القديمة، القدس")} style={styles.attach}><Ionicons name="location" size={18} color="#64748B" /></Pressable>
        <LocalizedTextInput multiline value={text} onChangeText={setText} placeholder={`اكتب رسالتك لـ ${technician.name.split(" ")[0]}...`} placeholderTextColor="#94A3B8" style={styles.input} />
        <Pressable accessibilityLabel="إرسال الرسالة" disabled={!text.trim()} onPress={() => void send(text)} style={({ pressed }) => [styles.send, !text.trim() && styles.sendDisabled, pressed && styles.pressed]}><Ionicons name="send" size={17} color={colors.text} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#E7E2D8", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 62, paddingHorizontal: 12 },
  headerButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 16, height: 34, justifyContent: "center", width: 34 },
  person: { alignItems: "center", flex: 1, flexDirection: "row-reverse", gap: 8 }, portrait: { position: "relative" }, online: { backgroundColor: "#10B981", borderColor: "white", borderRadius: 5, borderWidth: 1.5, bottom: -1, height: 10, position: "absolute", right: -1, width: 10 },
  nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "700" }, pro: { backgroundColor: "#FFF4C8", borderRadius: 4, color: "#8C6D14", fontSize: 8, fontWeight: "800", paddingHorizontal: 4 }, status: { color: "#059669", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" },
  safety: { alignItems: "center", backgroundColor: "#FFF8E3", borderBottomColor: "#EEDB9D", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 6, paddingHorizontal: 12, paddingVertical: 7 }, safetyText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, textAlign: "right", writingDirection: "rtl" },
  stream: { flexGrow: 1, gap: 10, padding: 12, paddingBottom: 20 }, day: { alignSelf: "center", backgroundColor: "#E7E5E4", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 }, dayText: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 8 },
  bubble: { ...shadows.subtle, borderRadius: 16, maxWidth: "85%", paddingHorizontal: 11, paddingVertical: 9 }, incoming: { alignSelf: "flex-end", backgroundColor: "white", borderColor: "#E7E2D8", borderTopRightRadius: 4, borderWidth: 1 }, outgoing: { alignSelf: "flex-start", backgroundColor: colors.primary, borderTopLeftRadius: 4 }, message: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 20, textAlign: "right", writingDirection: "rtl" }, time: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "left" },
  location: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: 10, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 7 }, locationIcon: { alignItems: "center", backgroundColor: "#DBEAFE", borderRadius: 9, height: 30, justifyContent: "center", width: 30 }, locationTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", textAlign: "right" }, locationText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" },
  inputBar: { alignItems: "flex-end", backgroundColor: "white", borderTopColor: "#E7E2D8", borderTopWidth: 1, flexDirection: "row", gap: 6, padding: 9 }, attach: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, input: { backgroundColor: "#FAFAF9", borderColor: "#E7E2D8", borderRadius: 12, borderWidth: 1, color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 11, maxHeight: 90, minHeight: 36, paddingHorizontal: 10, paddingVertical: 7, textAlign: "right", writingDirection: "rtl" }, send: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, sendDisabled: { opacity: 0.42 }, pressed: { opacity: 0.7, transform: [{ scale: 0.93 }] }
});
