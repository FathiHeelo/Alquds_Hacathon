import { StyleSheet, Text, View } from "react-native";

import type { Technician } from "../../../domain/models/technician";
import { colors, radius, shadows, typography } from "../../../shared/theme";

export function TechnicianMapMarker({ isSelected, technician }: { isSelected: boolean; technician: Technician }) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.marker, technician.isPro && styles.proMarker, isSelected && styles.selectedMarker]}>
        <Text style={styles.initial}>{technician.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center" },
  marker: {
    ...shadows.raised,
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderColor: colors.background,
    borderRadius: radius.round,
    borderWidth: 3,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  proMarker: { backgroundColor: colors.primary },
  selectedMarker: { borderColor: colors.tertiary, transform: [{ scale: 1.12 }] },
  initial: { color: colors.invertedText, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  pointer: { borderLeftColor: colors.transparent, borderLeftWidth: 5, borderRightColor: colors.transparent, borderRightWidth: 5, borderTopColor: colors.secondary, borderTopWidth: 7, height: 0, marginTop: -2, width: 0 }
});
