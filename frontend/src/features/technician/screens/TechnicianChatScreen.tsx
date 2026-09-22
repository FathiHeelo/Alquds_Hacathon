import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { technicianChatRepository as chatRepository } from "../../../services/repositories";
import type { ChatMessage } from "../../../domain/contracts/chatRepository";
import { colors, shadows, typography, useTheme } from "../../../shared/theme";

const externalContactPattern = /(?:\+?\d[\d\s-]{6,}|واتس(?:اب)?|whatsapp|تلغرام|telegram|فيسبوك|facebook|انستا(?:غرام)?|instagram|اتصل|رقمي|رقم الهاتف)/i;
const sanitizeMessage = (value: string) => externalContactPattern.test(value) ? "تم إخفاء بيانات تواصل لحماية الطرفين." : value;

export function TechnicianChatScreen({ route, navigation }: NativeStackScreenProps<TechnicianStackParamList, "TechnicianChat">) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<readonly ChatMessage[]>();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    void chatRepository.getMessages(route.params.conversationId).then((loaded) => { if (active) setMessages(loaded); }).catch(() => { if (active) { setMessages([]); setLoadError(true); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.conversationId]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    if (externalContactPattern.test(value)) {
      Alert.alert("حماية الخصوصية", "لا يمكن مشاركة رقم هاتف أو طلب تواصل خارج عَمِّرها. أرسل كل التفاصيل والاتفاقات داخل المحادثة.");
      return;
    }
    try {
      const stored = await chatRepository.send(route.params.conversationId, value);
      setMessages((current) => [...(current ?? []), stored]);
      setText("");
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch { Alert.alert("تعذر إرسال الرسالة", "تحقق من الاتصال وحاول مرة أخرى."); }
  };

  const sendLocation = async () => {
    try {
      const stored = await chatRepository.send(route.params.conversationId, "📍 موقعي التقريبي: شارع صلاح الدين، القدس • 31.7834, 35.2304");
      setMessages((current) => [...(current ?? []), stored]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch { Alert.alert("تعذر إرسال الموقع", "تحقق من الاتصال وحاول مرة أخرى."); }
  };

  return <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable><Image accessibilityLabel="صورة العميل" source={require("../../../../assets/customers/customer-default.jpg")} style={styles.customerImage} /><View style={styles.headerCopy}><View style={styles.nameRow}><LocalizedText style={styles.name}>{route.params.customerName === "عميل" ? "أحمد المقدسي" : route.params.customerName}</LocalizedText><Ionicons name="lock-closed" size={12} color="#047857" /></View><LocalizedText style={styles.customerMeta}>عميل موثّق • القدس</LocalizedText><LocalizedText numberOfLines={1} style={styles.problem}>{route.params.problem}</LocalizedText></View><View style={styles.headerButton}><Ionicons name="shield-checkmark" size={18} color="#8C6D14" /></View></View>
      <View style={styles.safety}><Ionicons name="shield-checkmark" size={14} color="#176B51" /><LocalizedText style={styles.safetyText}>هوية محمية: رقم الهاتف مخفي، والموقع لا يظهر إلا عند مشاركته داخل المحادثة.</LocalizedText></View>
      <ScrollView ref={listRef} contentContainerStyle={styles.stream} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}>
        <View style={styles.context}><Ionicons name="construct" size={15} color="#8C6D14" /><View style={styles.contextCopy}><LocalizedText style={styles.contextTitle}>موضوع المحادثة</LocalizedText><LocalizedText style={styles.contextText}>{route.params.problem}</LocalizedText></View></View>
        {loading ? <LocalizedText style={styles.emptyText}>جارٍ تحميل المحادثة...</LocalizedText> : null}
        {loadError ? <LocalizedText style={styles.emptyText}>تعذر تحميل المحادثة.</LocalizedText> : null}
        {!loading && !loadError && !messages?.length ? <LocalizedText style={styles.emptyText}>لا توجد رسائل بعد. ابدأ المحادثة برسالة.</LocalizedText> : null}
        {messages?.length ? <View style={styles.day}><LocalizedText style={styles.dayText}>المحادثة</LocalizedText></View> : null}
        {(messages ?? []).map((message) => {
          const outgoing = message.sender === "technician";
          const safeMessage = sanitizeMessage(message.text);
          return <View key={message.id} style={[styles.bubble, outgoing ? styles.outgoing : styles.incoming]}>{safeMessage.startsWith("📍") ? <View style={styles.location}><View style={styles.locationIcon}><Ionicons name="location" size={17} color="#1D4ED8" /></View><View><LocalizedText style={styles.locationTitle}>موقع تمت مشاركته</LocalizedText><LocalizedText style={styles.locationText}>{safeMessage.replace("📍", "").trim()}</LocalizedText></View></View> : <LocalizedText style={styles.message}>{safeMessage}</LocalizedText>}<LocalizedText style={styles.time}>{message.createdAt}</LocalizedText></View>;
        })}
      </ScrollView>
      <View style={styles.guard}><Ionicons name="information-circle" size={13} color="#8C6D14" /><LocalizedText style={styles.guardText}>سيتم منع الأرقام وروابط التواصل الخارجي تلقائياً.</LocalizedText></View>
      <View style={styles.inputBar}><Pressable accessibilityLabel="إرسال موقعي" disabled={loading || loadError} onPress={() => void sendLocation()} style={[styles.attach, (loading || loadError) && styles.disabled]}><Ionicons name="location" size={18} color={theme.info} /></Pressable><LocalizedTextInput multiline value={text} onChangeText={setText} placeholder={`اكتب لـ ${route.params.customerName === "عميل" ? "أحمد" : route.params.customerName} داخل عَمِّرها...`} placeholderTextColor="#94A3B8" style={styles.input} /><Pressable disabled={!text.trim() || loading || loadError} onPress={() => void send()} style={[styles.send, (!text.trim() || loading || loadError) && styles.disabled]}><Ionicons name="send" size={17} color={colors.text} /></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 8, minHeight: 70, paddingHorizontal: 10 }, headerButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, customerImage: { borderColor: colors.primary, borderRadius: 21, borderWidth: 1.5, height: 42, width: 42 }, headerCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, customerMeta: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700", marginTop: 1, textAlign: "right" }, problem: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, safety: { alignItems: "center", backgroundColor: "#ECFDF5", borderBottomColor: "#A7E6CD", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 5, paddingHorizontal: 11, paddingVertical: 7 }, safetyText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }, stream: { flexGrow: 1, gap: 9, padding: 12, paddingBottom: 18 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, paddingVertical: 16, textAlign: "center" }, context: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 9 }, contextCopy: { flex: 1 }, contextTitle: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700", textAlign: "right" }, contextText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" }, day: { alignSelf: "center", backgroundColor: "#E7E5E4", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 3 }, dayText: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 7 }, bubble: { ...shadows.subtle, borderRadius: 15, maxWidth: "84%", paddingHorizontal: 10, paddingVertical: 8 }, incoming: { alignSelf: "flex-end", backgroundColor: "white", borderColor: "#E7E2D8", borderTopRightRadius: 4, borderWidth: 1 }, outgoing: { alignSelf: "flex-start", backgroundColor: colors.primary, borderTopLeftRadius: 4 }, message: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 18, textAlign: "right", writingDirection: "rtl" }, time: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 3, textAlign: "left" }, location: { alignItems: "center", flexDirection: "row-reverse", gap: 7 }, locationIcon: { alignItems: "center", backgroundColor: "#DBEAFE", borderRadius: 9, height: 30, justifyContent: "center", width: 30 }, locationTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800", textAlign: "right" }, locationText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, guard: { alignItems: "center", backgroundColor: "#FFF8E3", flexDirection: "row-reverse", gap: 4, justifyContent: "center", paddingVertical: 6 }, guardText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7 }, inputBar: { alignItems: "flex-end", backgroundColor: "white", borderTopColor: "#E7E2D8", borderTopWidth: 1, flexDirection: "row", gap: 6, padding: 9 }, attach: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, input: { backgroundColor: "#FAFAF9", borderColor: "#E7E2D8", borderRadius: 12, borderWidth: 1, color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 10, maxHeight: 90, minHeight: 36, paddingHorizontal: 10, paddingVertical: 7, textAlign: "right", writingDirection: "rtl" }, send: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, disabled: { opacity: 0.4 }
});
