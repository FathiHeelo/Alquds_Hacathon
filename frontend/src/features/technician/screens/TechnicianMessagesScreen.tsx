import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { technicianChatRepository, technicianJobRepository } from "../../../services/repositories";
import type { ChatMessage } from "../../../domain/contracts/chatRepository";
import type { Job } from "../../../domain/models/job";

type Conversation = { job: Job; last?: ChatMessage };

export function TechnicianMessagesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TechnicianStackParamList>>();
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void technicianJobRepository.list().then((jobs) => Promise.all(jobs.filter((job) => job.conversationId).map(async (job) => ({ job, last: (await technicianChatRepository.getMessages(job.id)).at(-1) })))).then((rows) => { if (active) setConversations(rows); }).catch(() => { if (active) { setConversations([]); setFailed(true); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const filtered = useMemo(() => conversations.filter(({ job, last }) => (!query.trim() || `عميل ${job.description ?? ""} ${last?.text ?? ""}`.includes(query.trim()))), [conversations, query]);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}><View><LocalizedText style={styles.title}>رسائل العملاء</LocalizedText><LocalizedText style={styles.subtitle}>تواصل آمن حول طلبات الصيانة فقط</LocalizedText></View><View style={styles.headerIcon}><Ionicons name="chatbubbles" size={21} color={colors.primaryPressed} /></View></View>
    <View style={styles.privacy}><Ionicons name="shield-checkmark" size={17} color="#176B51" /><LocalizedText style={styles.privacyText}>تظهر لك هوية مختصرة: الاسم الأول والمشكلة فقط. لا نعرض رقم الهاتف أو بيانات التواصل الخارجية.</LocalizedText></View>
    <View style={styles.search}><Ionicons name="search" size={18} color="#94A3B8" /><LocalizedTextInput value={query} onChangeText={setQuery} placeholder="ابحث باسم العميل أو المشكلة" placeholderTextColor="#94A3B8" style={styles.searchInput} /></View>
    <View style={styles.tabs}><View style={[styles.tab, styles.activeTab]}><LocalizedText style={[styles.tabText, styles.activeTabText]}>كل المحادثات</LocalizedText></View></View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {filtered.map(({ job, last }) => <Pressable key={job.id} onPress={() => navigation.navigate("TechnicianChat", { conversationId: job.id, requestId: job.requestId, customerName: "عميل", problem: job.description ?? "طلب صيانة" })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.avatar}><LocalizedText style={styles.avatarText}>ع</LocalizedText><View style={styles.lock}><Ionicons name="lock-closed" size={8} color="white" /></View></View>
        <View style={styles.copy}><View style={styles.nameRow}><LocalizedText style={styles.name}>عميل</LocalizedText><View style={styles.privateBadge}><LocalizedText style={styles.privateText}>هوية محمية</LocalizedText></View></View><LocalizedText style={styles.problem}>{job.description ?? "طلب صيانة"}</LocalizedText><LocalizedText numberOfLines={1} style={styles.message}>{last?.text ?? "لا توجد رسائل بعد"}</LocalizedText></View>
        <View style={styles.meta}><LocalizedText style={styles.time}>{last?.createdAt ?? ""}</LocalizedText><Ionicons name="chevron-back" size={15} color="#94A3B8" /></View>
      </Pressable>)}
      {loading ? <View style={styles.empty}><LocalizedText style={styles.emptyText}>جارٍ تحميل المحادثات...</LocalizedText></View> : null}
      {!loading && !filtered.length ? <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={36} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>{failed ? "تعذر تحميل المحادثات" : "لا توجد محادثات بعد"}</LocalizedText></View> : null}
      <View style={styles.platformNote}><Ionicons name="warning-outline" size={16} color="#8C6D14" /><LocalizedText style={styles.platformText}>لضمان حقك، لا تشارك رقمك ولا تطلب من العميل التواصل خارج عَمِّرها.</LocalizedText></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 11, paddingHorizontal: 16, paddingTop: 10 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, privacy: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#A7E6CD", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 7, marginHorizontal: 14, padding: 10 }, privacyText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }, search: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#E8E2D6", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 8, marginHorizontal: 14, marginTop: 10, minHeight: 45, paddingHorizontal: 12 }, searchInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 11, textAlign: "right", writingDirection: "rtl" }, tabs: { flexDirection: "row-reverse", gap: 7, paddingHorizontal: 14, paddingTop: 10 }, tab: { borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7 }, activeTab: { backgroundColor: colors.secondary }, tabText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, activeTabText: { color: "white" }, list: { gap: 9, padding: 14, paddingBottom: 28 },
  card: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 88, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, avatar: { alignItems: "center", backgroundColor: colors.secondary, borderColor: colors.primary, borderRadius: 24, borderWidth: 1.5, height: 48, justifyContent: "center", position: "relative", width: 48 }, avatarText: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 18, fontWeight: "800" }, lock: { alignItems: "center", backgroundColor: "#047857", borderColor: "white", borderRadius: 7, borderWidth: 1.5, bottom: -2, height: 15, justifyContent: "center", position: "absolute", right: -2, width: 15 }, copy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "700" }, privateBadge: { backgroundColor: "#ECFDF5", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }, privateText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 6, fontWeight: "700" }, problem: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", marginTop: 3, textAlign: "right" }, message: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3, textAlign: "right" }, meta: { alignItems: "center", alignSelf: "stretch", justifyContent: "space-between", paddingVertical: 4 }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7 }, unread: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, height: 19, justifyContent: "center", width: 19 }, unreadText: { color: colors.text, fontSize: 8, fontWeight: "800" }, empty: { alignItems: "center", padding: 55 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 6 }, platformNote: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 6, padding: 10 }, platformText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }
});
