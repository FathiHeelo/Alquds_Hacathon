import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";

type MessagesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, "CustomerMessages">,
  NativeStackNavigationProp<CustomerStackParamList>
>;

const conversations = [
  { technicianId: "tech-tariq-maqdisi", jobId: "demo-job-offer-tariq-plumbing", requestId: "old_city_plumbing_leak", message: "وصلت الآن مدخل عقبة الخالدية، وباقي دقيقتين.", time: "10:18 ص", unread: 2, online: true },
  { technicianId: "tech-mahmoud-khatib", jobId: "demo-job-offer-mahmoud-plumbing", requestId: "old_city_plumbing_leak", message: "أرسلت لك تفاصيل الفحص والقطع المطلوبة.", time: "أمس", unread: 0, online: true },
  { technicianId: "tech-samer-halawani", jobId: "demo-job-offer-samer-ac", requestId: "ac_follow_up", message: "تم، موعدنا غدًا الساعة التاسعة صباحًا.", time: "الثلاثاء", unread: 0, online: false }
] as const;

export function CustomerMessagesScreen() {
  const navigation = useNavigation<MessagesNavigation>();
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const entrance = useRef(conversations.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(70, entrance.map((value) => Animated.timing(value, { toValue: 1, duration: 260, useNativeDriver: true }))).start();
  }, [entrance]);
  const filtered = useMemo(() => conversations.filter((conversation) => {
    const technician = demoTechnicians.find(({ id }) => id === conversation.technicianId)!;
    return (!unreadOnly || conversation.unread > 0) && (!query.trim() || `${technician.name} ${technician.specialty} ${conversation.message}`.includes(query.trim()));
  }), [query, unreadOnly]);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}>
      <View><Text style={styles.title}>الرسائل</Text><Text style={styles.subtitle}>تواصل آمن مع فنيي عَمِّرها</Text></View>
      <View style={styles.headerIcon}><Ionicons name="chatbubbles" color={colors.primaryPressed} size={21} /></View>
    </View>
    <View style={styles.searchBox}><Ionicons name="search" size={18} color="#94A3B8" /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث عن فني أو محادثة" placeholderTextColor="#94A3B8" style={styles.searchInput} /></View>
    <View style={styles.tabs}>
      <Pressable onPress={() => setUnreadOnly(false)} style={[styles.tab, !unreadOnly && styles.activeTab]}><Text style={[styles.tabText, !unreadOnly && styles.activeTabText]}>كل المحادثات</Text></Pressable>
      <Pressable onPress={() => setUnreadOnly(true)} style={[styles.tab, unreadOnly && styles.activeTab]}><Text style={[styles.tabText, unreadOnly && styles.activeTabText]}>غير مقروءة</Text><View style={styles.unreadMini}><Text style={styles.unreadMiniText}>2</Text></View></Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {filtered.map((conversation) => {
        const index = conversations.indexOf(conversation);
        const technician = demoTechnicians.find(({ id }) => id === conversation.technicianId)!;
        return <Animated.View key={conversation.technicianId} style={{ opacity: entrance[index], transform: [{ translateY: entrance[index].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`فتح محادثة ${technician.name}`} onPress={() => navigation.navigate("CustomerChat", { jobId: conversation.jobId, requestId: conversation.requestId, technicianId: conversation.technicianId })} style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}>
            <View style={styles.portrait}><TechnicianPortrait technician={technician} round size={48} /><View style={[styles.online, !conversation.online && styles.offline]} /></View>
            <View style={styles.copy}>
              <View style={styles.nameRow}><Text style={styles.name}>{technician.name}</Text>{technician.isPro ? <Text style={styles.pro}>Pro</Text> : <Ionicons name="checkmark-circle" color={colors.primaryPressed} size={13} />}</View>
              <Text numberOfLines={1} style={[styles.message, conversation.unread > 0 && styles.unreadMessage]}>{conversation.message}</Text>
              <Text numberOfLines={1} style={styles.context}>{technician.specialty}</Text>
            </View>
            <View style={styles.meta}><Text style={styles.time}>{conversation.time}</Text>{conversation.unread > 0 ? <View style={styles.unread}><Text style={styles.unreadText}>{conversation.unread}</Text></View> : <Ionicons name="checkmark-done" size={15} color="#10B981" />}</View>
          </Pressable>
        </Animated.View>;
      })}
      {!filtered.length ? <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={34} color="#CBD5E1" /><Text style={styles.emptyText}>لا توجد محادثات مطابقة</Text></View> : null}
      <View style={styles.privacy}><Ionicons name="shield-checkmark" size={17} color="#8C6D14" /><Text style={styles.privacyText}>جميع محادثاتك محمية داخل عَمِّرها</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" },
  headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  searchBox: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#E8E2D6", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 8, marginHorizontal: 14, minHeight: 46, paddingHorizontal: 12 },
  searchInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 12, textAlign: "right", writingDirection: "rtl" },
  tabs: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 14, paddingTop: 12 }, tab: { alignItems: "center", borderRadius: 12, flexDirection: "row-reverse", gap: 5, paddingHorizontal: 12, paddingVertical: 7 }, activeTab: { backgroundColor: colors.secondary }, tabText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "600" }, activeTabText: { color: "white" }, unreadMini: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, height: 16, justifyContent: "center", minWidth: 16 }, unreadMiniText: { color: colors.text, fontSize: 8, fontWeight: "800" },
  list: { gap: 9, padding: 14, paddingBottom: 28 }, conversation: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 10, minHeight: 84, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  portrait: { position: "relative" }, online: { backgroundColor: "#10B981", borderColor: "white", borderRadius: 6, borderWidth: 2, bottom: -1, height: 12, position: "absolute", right: -1, width: 12 }, offline: { backgroundColor: "#94A3B8" }, copy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700" }, pro: { backgroundColor: "#FFF4C8", borderRadius: 4, color: "#8C6D14", fontSize: 8, fontWeight: "800", paddingHorizontal: 4 }, message: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 4, textAlign: "right", writingDirection: "rtl" }, unreadMessage: { color: colors.text, fontWeight: "700" }, context: { color: "#A3A3A3", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "right" }, meta: { alignItems: "center", alignSelf: "stretch", justifyContent: "space-between", paddingVertical: 5 }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8 }, unread: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, height: 20, justifyContent: "center", width: 20 }, unreadText: { color: colors.text, fontSize: 9, fontWeight: "800" },
  empty: { alignItems: "center", gap: 7, paddingVertical: 50 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 12 }, privacy: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 7, justifyContent: "center", marginTop: 4, padding: 10 }, privacyText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }
});
