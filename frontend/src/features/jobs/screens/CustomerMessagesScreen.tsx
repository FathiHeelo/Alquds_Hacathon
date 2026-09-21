import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography, useTheme } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";
import { customerJobRepository } from "../../../services/repositories";
import type { Technician } from "../../../domain/models/technician";
import type { Job } from "../../../domain/models/job";

type MessagesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, "CustomerMessages">,
  NativeStackNavigationProp<CustomerStackParamList>
>;

type Conversation = { job: Job; technician?: Technician; last?: Job["lastMessage"] };

export function CustomerMessagesScreen() {
  const navigation = useNavigation<MessagesNavigation>();
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { reduceMotion } = useTheme();
  const entrance = useRef(Array.from({ length: 30 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    let active = true;
    void customerJobRepository.list().then((jobs) => jobs.filter((job) => job.conversationId).map((job) => ({ job, technician: job.technician, last: job.lastMessage }))).then((rows) => { if (active) setConversations(rows); }).catch(() => { if (active) { setConversations([]); setFailed(true); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (reduceMotion) { entrance.forEach((value) => value.setValue(1)); return; }
    Animated.stagger(70, entrance.map((value) => Animated.timing(value, { toValue: 1, duration: 260, useNativeDriver: true }))).start();
  }, [entrance, reduceMotion]);
  const filtered = useMemo(() => conversations.filter((conversation) => (!query.trim() || `${conversation.technician?.name ?? "الفني"} ${conversation.technician?.specialty ?? ""} ${conversation.last?.text ?? ""}`.includes(query.trim()))), [query, conversations]);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}>
      <View><LocalizedText style={styles.title}>الرسائل</LocalizedText><LocalizedText style={styles.subtitle}>تواصل آمن مع فنيي عَمِّرها</LocalizedText></View>
      <View style={styles.headerIcon}><Ionicons name="chatbubbles" color={colors.primaryPressed} size={21} /></View>
    </View>
    <View style={styles.searchBox}><Ionicons name="search" size={18} color="#94A3B8" /><LocalizedTextInput value={query} onChangeText={setQuery} placeholder="ابحث عن فني أو محادثة" placeholderTextColor="#94A3B8" style={styles.searchInput} /></View>
    <View style={styles.tabs}><View style={[styles.tab, styles.activeTab]}><LocalizedText style={[styles.tabText, styles.activeTabText]}>كل المحادثات</LocalizedText></View></View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {filtered.map((conversation) => {
        const index = filtered.indexOf(conversation);
        const technician = conversation.technician;
        const name = technician?.name ?? "الفني";
        return <Animated.View key={conversation.job.id} style={{ opacity: entrance[index] ?? 1, transform: [{ translateY: (entrance[index] ?? entrance[0]).interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`فتح محادثة ${name}`} onPress={() => navigation.navigate("CustomerChat", { jobId: conversation.job.id, requestId: conversation.job.requestId, technicianId: conversation.job.technicianId })} style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}>
            <View style={styles.portrait}>{technician ? <TechnicianPortrait technician={technician} round size={48} /> : <View style={styles.avatar}><Ionicons name="person" size={21} color={colors.primary} /></View>}</View>
            <View style={styles.copy}>
              <View style={styles.nameRow}><LocalizedText style={styles.name}>{name}</LocalizedText>{technician?.isPro ? <LocalizedText style={styles.pro}>Pro</LocalizedText> : null}</View>
              <LocalizedText numberOfLines={1} style={styles.message}>{conversation.last?.text ?? "لا توجد رسائل بعد"}</LocalizedText>
              <LocalizedText numberOfLines={1} style={styles.context}>{technician?.specialty ?? conversation.job.description ?? "طلب صيانة"}</LocalizedText>
            </View>
            <View style={styles.meta}><LocalizedText style={styles.time}>{conversation.last?.createdAt ?? ""}</LocalizedText><Ionicons name="chevron-back" size={15} color="#94A3B8" /></View>
          </Pressable>
        </Animated.View>;
      })}
      {loading ? <View style={styles.empty}><LocalizedText style={styles.emptyText}>جارٍ تحميل المحادثات...</LocalizedText></View> : null}
      {!loading && !filtered.length ? <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={34} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>{failed ? "تعذر تحميل المحادثات" : "لا توجد محادثات بعد"}</LocalizedText></View> : null}
      <View style={styles.privacy}><Ionicons name="shield-checkmark" size={17} color="#8C6D14" /><LocalizedText style={styles.privacyText}>جميع محادثاتك محمية داخل عَمِّرها</LocalizedText></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" },
  headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  searchBox: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#E8E2D6", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 8, marginHorizontal: 14, minHeight: 46, paddingHorizontal: 12 },
  searchInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 12, textAlign: "right", writingDirection: "rtl" },
  tabs: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 14, paddingTop: 12 }, tab: { alignItems: "center", borderRadius: 12, flexDirection: "row-reverse", gap: 5, paddingHorizontal: 12, paddingVertical: 7 }, activeTab: { backgroundColor: colors.secondary }, tabText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "600" }, activeTabText: { color: "white" }, unreadMini: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, height: 16, justifyContent: "center", minWidth: 16 }, unreadMiniText: { color: colors.text, fontSize: 8, fontWeight: "800" },
  list: { gap: 9, padding: 14, paddingBottom: 28 }, conversation: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 84, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  portrait: { position: "relative" }, avatar: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 24, height: 48, justifyContent: "center", width: 48 }, online: { backgroundColor: "#10B981", borderColor: "white", borderRadius: 6, borderWidth: 2, bottom: -1, height: 12, position: "absolute", right: -1, width: 12 }, offline: { backgroundColor: "#94A3B8" }, copy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700" }, pro: { backgroundColor: "#FFF4C8", borderRadius: 4, color: "#8C6D14", fontSize: 8, fontWeight: "800", paddingHorizontal: 4 }, message: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 4, textAlign: "right", writingDirection: "rtl" }, unreadMessage: { color: colors.text, fontWeight: "700" }, context: { color: "#A3A3A3", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "right" }, meta: { alignItems: "center", alignSelf: "stretch", justifyContent: "space-between", paddingVertical: 5 }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8 }, unread: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, height: 20, justifyContent: "center", width: 20 }, unreadText: { color: colors.text, fontSize: 9, fontWeight: "800" },
  empty: { alignItems: "center", gap: 7, paddingVertical: 50 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 12 }, privacy: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 7, justifyContent: "center", marginTop: 4, padding: 10 }, privacyText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }
});
