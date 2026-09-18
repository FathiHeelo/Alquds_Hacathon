import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Technician } from "../../../domain/models/technician";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "./TechnicianPortrait";

export function TechnicianMapMarker({ isSelected, technician }: { isSelected: boolean; technician: Technician }) {
  const category = technician.categoryIds[0];
  const icon = technician.isPro ? "star" : category === "electrical" ? "flash" : category === "ac" ? "snow" : "water";
  return <View style={styles.wrapper}>
    <View style={[styles.ring, isSelected && styles.selected]}>
      <TechnicianPortrait technician={technician} round size={36} />
      <View style={[styles.online, !technician.isAvailable && styles.offline]} />
      <View style={[styles.trade, { backgroundColor: technician.isPro ? colors.secondary : category === "electrical" ? "#F59E0B" : "#0EA5C6" }]}><Ionicons name={icon} color={technician.isPro ? colors.primary : "white"} size={10} /></View>
    </View>
    <Text numberOfLines={1} style={styles.label}>{technician.name.split(" ")[0]}{technician.isPro ? " (Pro)" : ""} · {technician.distanceKm.toFixed(1)} كم</Text>
  </View>;
}
const styles = StyleSheet.create({
  wrapper: { width: 132, height: 76, alignItems: "center", justifyContent: "center", padding: 5 },
  ring: { padding: 3, borderRadius: 24, borderWidth: 2, borderColor: "transparent" },
  selected: { backgroundColor: "#F5E6BE", borderColor: "#E8CE77" },
  online: { position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981", borderWidth: 1.5, borderColor: "white" },
  offline: { backgroundColor: "#94A3B8" },
  trade: { position: "absolute", bottom: -1, left: -3, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "white", alignItems: "center", justifyContent: "center" },
  label: { ...shadows.subtle, backgroundColor: "white", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, color: "#475569", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "center", writingDirection: "rtl" }
});
