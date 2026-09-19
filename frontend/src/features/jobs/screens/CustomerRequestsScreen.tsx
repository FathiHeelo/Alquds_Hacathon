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
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import { colors, shadows, typography, useTheme } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";
import { customerRequests, type CustomerRequestState } from "../customerRequests";

type RequestsNavigation = CompositeNavigationProp<BottomTabNavigationProp<CustomerTabParamList, "CustomerRequests">, NativeStackNavigationProp<CustomerStackParamList>>;
type Filter = "all" | "active" | "completed";

const statusAppearance: Record<CustomerRequestState, { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = {
  on_the_way: { icon: "navigate", color: "#047857", background: "#ECFDF5" },
  scheduled: { icon: "calendar", color: "#8C6D14", background: "#FFF8E3" },
  completed: { icon: "checkmark-circle", color: "#047857", background: "#ECFDF5" },
  cancelled: { icon: "close-circle", color: "#9F1239", background: "#FFF1F2" }
};

export function CustomerRequestsScreen() {
  const navigation = useNavigation<RequestsNavigation>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { reduceMotion } = useTheme();
  const entrance = useRef(customerRequests.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reduceMotion) { entrance.forEach((value) => value.setValue(1)); return; }
    Animated.stagger(65, entrance.map((value) => Animated.timing(value, { toValue: 1, duration: 260, useNativeDriver: true }))).start();
  }, [entrance, reduceMotion]);

  const filtered = useMemo(() => customerRequests.filter((request) => {
    const technician = demoTechnicians.find(({ id }) => id === request.technicianId);
    const matchesFilter = filter === "all" || (filter === "active" ? request.state === "on_the_way" || request.state === "scheduled" : request.state === "completed" || request.state === "cancelled");
    const haystack = `${request.title} ${request.category} ${request.orderNumber} ${technician?.name ?? ""}`;
    return matchesFilter && (!query.trim() || haystack.includes(query.trim()));
  }), [filter, query]);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}>
      <View><LocalizedText style={styles.title}>طلباتي</LocalizedText><LocalizedText style={styles.subtitle}>تابع كل طلبات الصيانة من مكان واحد</LocalizedText></View>
      <View style={styles.headerIcon}><Ionicons name="document-text" color={colors.primaryPressed} size={21} /></View>
    </View>
    <View style={styles.searchBox}><Ionicons name="search" size={18} color="#94A3B8" /><LocalizedTextInput value={query} onChangeText={setQuery} placeholder="ابحث عن طلب أو فني" placeholderTextColor="#94A3B8" style={styles.searchInput} /></View>
    <View style={styles.tabs}>
      {([["all", "كل الطلبات"], ["active", "الجارية"], ["completed", "السابقة"]] as const).map(([id, label]) => <Pressable key={id} onPress={() => setFilter(id)} style={[styles.tab, filter === id && styles.activeTab]}><LocalizedText style={[styles.tabText, filter === id && styles.activeTabText]}>{label}</LocalizedText></Pressable>)}
    </View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {filtered.map((request) => {
        const index = customerRequests.indexOf(request);
        const technician = demoTechnicians.find(({ id }) => id === request.technicianId)!;
        const appearance = statusAppearance[request.state];
        return <Animated.View key={request.id} style={{ opacity: entrance[index], transform: [{ translateY: entrance[index].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`فتح الطلب ${request.title}`} onPress={() => navigation.navigate("CustomerRequestDetails", { requestId: request.id })} style={({ pressed }) => [styles.requestCard, pressed && styles.pressed]}>
            <View style={styles.topRow}>
              <View style={styles.personRow}><TechnicianPortrait technician={technician} round size={46} /><View style={styles.requestCopy}><LocalizedText style={styles.requestTitle}>{request.title}</LocalizedText><LocalizedText style={styles.technician}>{technician.name} • {request.category}</LocalizedText></View></View>
              <View style={[styles.statusBadge, { backgroundColor: appearance.background }]}><Ionicons name={appearance.icon} size={12} color={appearance.color} /><LocalizedText style={[styles.statusText, { color: appearance.color }]}>{request.statusLabel}</LocalizedText></View>
            </View>
            <View style={styles.divider} />
            <View style={styles.metaRow}><View style={styles.metaItem}><Ionicons name="location-outline" size={13} color="#64748B" /><LocalizedText numberOfLines={1} style={styles.metaText}>{request.location}</LocalizedText></View><LocalizedText style={styles.orderNumber}>{request.orderNumber}</LocalizedText></View>
            <View style={styles.bottomRow}><LocalizedText style={styles.date}>{request.date}</LocalizedText><View style={styles.openRow}><LocalizedText style={styles.openText}>عرض التفاصيل</LocalizedText><Ionicons name="chevron-back" size={14} color={colors.primaryPressed} /></View></View>
          </Pressable>
        </Animated.View>;
      })}
      {!filtered.length ? <View style={styles.empty}><Ionicons name="documents-outline" size={36} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>لا توجد طلبات مطابقة</LocalizedText></View> : null}
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 },
  header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 },
  title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" },
  subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" },
  headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  searchBox: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#E8E2D6", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 8, marginHorizontal: 14, minHeight: 46, paddingHorizontal: 12 },
  searchInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 12, textAlign: "right", writingDirection: "rtl" },
  tabs: { flexDirection: "row-reverse", gap: 7, paddingHorizontal: 14, paddingTop: 12 },
  tab: { alignItems: "center", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 7 }, activeTab: { backgroundColor: colors.secondary },
  tabText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "600" }, activeTabText: { color: "white" },
  list: { gap: 10, padding: 14, paddingBottom: 28 }, requestCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, padding: 12 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  topRow: { alignItems: "flex-start", flexDirection: "row-reverse", gap: 8, justifyContent: "space-between" }, personRow: { alignItems: "center", flex: 1, flexDirection: "row-reverse", gap: 9 }, requestCopy: { flex: 1 },
  requestTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700", textAlign: "right", writingDirection: "rtl" }, technician: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, marginTop: 3, textAlign: "right" },
  statusBadge: { alignItems: "center", borderRadius: 10, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, statusText: { fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, divider: { backgroundColor: "#F0ECE3", height: 1, marginVertical: 10 },
  metaRow: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, metaItem: { alignItems: "center", flex: 1, flexDirection: "row-reverse", gap: 4 }, metaText: { color: "#64748B", flex: 1, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, orderNumber: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 9 },
  bottomRow: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 10 }, date: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8 }, openRow: { alignItems: "center", flexDirection: "row-reverse", gap: 2 }, openText: { color: colors.primaryPressed, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" },
  empty: { alignItems: "center", gap: 7, paddingVertical: 54 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 12 }
});
