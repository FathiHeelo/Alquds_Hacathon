import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { Animated, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { jobRepository } from "../../../demo/adapters/demoJobRepository";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import type { Job } from "../../../domain/models/job";
import { LoadingState } from "../../../shared/components";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";

type RequestsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, "CustomerRequests">,
  NativeStackNavigationProp<CustomerStackParamList>
>;

const jobId = "demo-job-offer-tariq-plumbing";
const requestId = "old_city_plumbing_leak";
const technicianId = "tech-tariq-maqdisi";
const route = [
  { latitude: 31.7804, longitude: 35.2332 },
  { latitude: 31.7811, longitude: 35.2322 },
  { latitude: 31.7822, longitude: 35.2312 },
  { latitude: 31.7834, longitude: 35.2304 }
];
const region: Region = { latitude: 31.7819, longitude: 35.2318, latitudeDelta: 0.007, longitudeDelta: 0.006 };

const steps = [
  { title: "تم قبول العرض والاتفاق", detail: "10:14 ص • 120 شيكل", state: "done" },
  { title: "الفني يتحرك نحوك", detail: "الآن • الوصول خلال 5 إلى 7 دقائق", state: "active" },
  { title: "بدء تنفيذ الصيانة", detail: "بانتظار وصول الفني", state: "pending" },
  { title: "إتمام العمل والدفع", detail: "الدفع بعد تأكيد إنجاز الصيانة", state: "pending" }
] as const;

export function CustomerRequestsScreen() {
  const navigation = useNavigation<RequestsNavigation>();
  const [job, setJob] = useState<Job>();
  const pulse = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const technician = demoTechnicians.find(({ id }) => id === technicianId)!;

  useEffect(() => {
    void jobRepository.getJob(jobId).then(async (loaded) => {
      if (!loaded) return;
      setJob(loaded.status === "accepted" ? await jobRepository.updateStatus(loaded.id, "on_the_way") : loaded);
    });
  }, []);

  useEffect(() => {
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true })
    ]));
    const bobLoop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -6, duration: 650, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 650, useNativeDriver: true })
    ]));
    pulseLoop.start();
    bobLoop.start();
    return () => { pulseLoop.stop(); bobLoop.stop(); };
  }, [bob, pulse]);

  if (!job) return <SafeAreaView style={styles.safe}><LoadingState /></SafeAreaView>;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerAction}><Ionicons name="ellipsis-horizontal" size={18} color="#64748B" /></View>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>متابعة الصيانة</Text><Text style={styles.headerSubtitle}>طلب رقم #JM-7821</Text></View>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>مباشر</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapCard}>
          <MapView initialRegion={region} pitchEnabled={false} rotateEnabled={false} scrollEnabled={false} style={styles.map} userInterfaceStyle="light">
            <Polyline coordinates={route} strokeColor={colors.primary} strokeWidth={4} lineDashPattern={[8, 7]} />
            <Marker coordinate={route[0]} anchor={{ x: 0.5, y: 0.7 }}>
              <Animated.View pointerEvents="none" style={{ transform: [{ translateY: bob }] }}>
                <View style={styles.techPin}><Ionicons name="bicycle" size={17} color={colors.primary} /></View>
                <Text style={styles.pinLabel}>طارق • 5 دقائق</Text>
              </Animated.View>
            </Marker>
            <Marker coordinate={route[3]} anchor={{ x: 0.5, y: 0.7 }}>
              <View style={styles.homePin}><Ionicons name="home" size={13} color="white" /></View>
            </Marker>
          </MapView>
          <View style={styles.mapStatus}><Ionicons name="navigate" size={14} color={colors.primaryPressed} /><Text style={styles.mapStatusText}>الفني في الطريق إليك</Text></View>
        </View>

        <View style={styles.statusCard}>
          <Animated.View style={[styles.statusPulse, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.45] }) }] }]} />
          <View style={styles.statusIcon}><Ionicons name="flash" size={19} color="#5A4300" /></View>
          <View style={styles.statusCopy}><Text style={styles.statusEyebrow}>الحالة الحالية</Text><Text style={styles.statusTitle}>الفني في الطريق إليك</Text><Text style={styles.statusDetail}>على بعد 400 متر • الوصول خلال 5–7 دقائق</Text></View>
        </View>

        <View style={styles.technicianCard}>
          <TechnicianPortrait technician={technician} size={54} />
          <View style={styles.technicianCopy}>
            <View style={styles.nameRow}><Text style={styles.technicianName}>{technician.name}</Text><Ionicons name="checkmark-circle" size={14} color={colors.primaryPressed} /></View>
            <Text style={styles.specialty}>{technician.specialty}</Text>
            <Text style={styles.rating}>★ {technician.rating.toFixed(1)} · {technician.completedJobs} عملية</Text>
          </View>
          <Pressable accessibilityLabel="الاتصال بالفني" onPress={() => void Linking.openURL("tel:+970599000000")} style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}><Ionicons name="call" size={18} color="#176B51" /></Pressable>
          <Pressable accessibilityLabel="مراسلة الفني" onPress={() => navigation.navigate("CustomerChat", { jobId, requestId, technicianId })} style={({ pressed }) => [styles.roundButton, styles.chatButton, pressed && styles.pressed]}><Ionicons name="chatbubble-ellipses" size={18} color="#5A4300" /></Pressable>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>مراحل تنفيذ العمل</Text>
          {steps.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View style={[styles.stepDot, step.state === "done" && styles.doneDot, step.state === "active" && styles.activeDot]}>
                  {step.state === "done" ? <Ionicons name="checkmark" size={12} color="white" /> : step.state === "active" ? <Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) }}><View style={styles.activeCore} /></Animated.View> : <View style={styles.pendingCore} />}
                </View>
                {index < steps.length - 1 ? <View style={[styles.line, step.state === "done" && styles.doneLine]} /> : null}
              </View>
              <View style={styles.stepCopy}><Text style={[styles.stepTitle, step.state === "active" && styles.activeTitle]}>{step.title}</Text><Text style={styles.stepDetail}>{step.detail}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeading}><View style={styles.summaryIcon}><Ionicons name="receipt" size={17} color="#176B51" /></View><View><Text style={styles.sectionTitle}>ملخص طلب الصيانة</Text><Text style={styles.summaryMuted}>تسريب سيفون تحت المجلى</Text></View></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>السعر المتفق عليه</Text><Text style={styles.price}>{job.agreedPrice} ₪</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>الموقع</Text><Text style={styles.summaryValue}>{job.locationLabel}</Text></View>
          <View style={styles.guarantee}><Ionicons name="shield-checkmark" size={15} color="#176B51" /><Text style={styles.guaranteeText}>دفع آمن وضمان عَمِّرها على تنفيذ العمل</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F7F4" },
  header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 62, paddingHorizontal: 16 },
  headerAction: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  headerCopy: { flex: 1, alignItems: "center" },
  headerTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 16, fontWeight: "700", writingDirection: "rtl" },
  headerSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10 },
  liveBadge: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 12, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 8, paddingVertical: 5 },
  liveDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, liveText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" },
  content: { gap: 12, paddingBottom: 24 },
  mapCard: { height: 216, overflow: "hidden", backgroundColor: "#E8ECEB" }, map: { position: "absolute", bottom: 0, left: 0, right: 0, top: 0 },
  mapStatus: { ...shadows.subtle, alignItems: "center", alignSelf: "center", backgroundColor: "white", borderRadius: 12, bottom: 10, flexDirection: "row-reverse", gap: 5, paddingHorizontal: 10, paddingVertical: 6, position: "absolute" },
  mapStatusText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700" },
  techPin: { alignItems: "center", backgroundColor: colors.secondary, borderColor: "white", borderRadius: 20, borderWidth: 2, height: 38, justifyContent: "center", width: 38 },
  pinLabel: { ...shadows.subtle, backgroundColor: colors.secondary, borderRadius: 6, color: "white", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", marginTop: 2, paddingHorizontal: 5, paddingVertical: 2 },
  homePin: { alignItems: "center", backgroundColor: "#2563EB", borderColor: "white", borderRadius: 14, borderWidth: 2, height: 28, justifyContent: "center", width: 28 },
  statusCard: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#E7CB69", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 11, marginHorizontal: 14, overflow: "hidden", padding: 13 },
  statusPulse: { backgroundColor: colors.primary, borderRadius: 25, height: 50, left: 5, position: "absolute", width: 50 }, statusIcon: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, height: 38, justifyContent: "center", width: 38 },
  statusCopy: { flex: 1 }, statusEyebrow: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" }, statusTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700", textAlign: "right" }, statusDetail: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" },
  technicianCard: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, flexDirection: "row-reverse", gap: 9, marginHorizontal: 14, padding: 12 },
  technicianCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, technicianName: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700" }, specialty: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, rating: { color: "#B58100", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" },
  roundButton: { alignItems: "center", backgroundColor: "#E8F7F1", borderRadius: 12, height: 38, justifyContent: "center", width: 38 }, chatButton: { backgroundColor: "#FFF4C8" }, pressed: { opacity: 0.65, transform: [{ scale: 0.93 }] },
  timelineCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, marginHorizontal: 14, padding: 15 }, sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700", textAlign: "right", writingDirection: "rtl" },
  stepRow: { flexDirection: "row-reverse", minHeight: 68 }, stepRail: { alignItems: "center", marginLeft: 10, width: 24 }, stepDot: { alignItems: "center", backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", borderRadius: 12, borderWidth: 1, height: 24, justifyContent: "center", width: 24 }, doneDot: { backgroundColor: "#10B981", borderColor: "#10B981" }, activeDot: { backgroundColor: "#FFF4C8", borderColor: colors.primary }, activeCore: { backgroundColor: colors.primary, borderRadius: 5, height: 10, width: 10 }, pendingCore: { backgroundColor: "#CBD5E1", borderRadius: 4, height: 7, width: 7 }, line: { backgroundColor: "#E2E8F0", flex: 1, width: 2 }, doneLine: { backgroundColor: "#A7E6CD" }, stepCopy: { flex: 1, paddingBottom: 12 }, stepTitle: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "600", textAlign: "right" }, activeTitle: { color: "#9A7200", fontWeight: "700" }, stepDetail: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 9, marginTop: 3, textAlign: "right" },
  summaryCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, gap: 10, marginHorizontal: 14, padding: 15 }, summaryHeading: { alignItems: "center", flexDirection: "row-reverse", gap: 9 }, summaryIcon: { alignItems: "center", backgroundColor: "#E8F7F1", borderRadius: 10, height: 34, justifyContent: "center", width: 34 }, summaryMuted: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, divider: { backgroundColor: "#F0ECE3", height: 1 }, summaryRow: { flexDirection: "row-reverse", justifyContent: "space-between" }, summaryLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10 }, summaryValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "600" }, price: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800" }, guarantee: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 10, flexDirection: "row-reverse", gap: 5, justifyContent: "center", padding: 8 }, guaranteeText: { color: "#176B51", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }
});
