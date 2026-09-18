import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import type { Technician } from "../../../domain/models/technician";
import { Badge, Button, Card } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, spacing, typography } from "../../../shared/theme";

interface TechnicianPreviewProps {
  onProfile(): void;
  onRepairRequest(): void;
  technician: Technician;
  actionLabel?: string;
  children?: ReactNode;
}

export function TechnicianPreview({ onProfile, onRepairRequest, technician, actionLabel = uiText.map.repairRequest, children }: TechnicianPreviewProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{technician.name.slice(0, 1)}</Text></View>
        <View style={styles.identity}>
          <Text style={styles.name}>{technician.name}</Text>
          <Text style={styles.specialty}>{technician.specialty}</Text>
        </View>
        <Text style={[styles.availability, !technician.isAvailable && styles.unavailable]}>
          {technician.isAvailable ? uiText.map.available : uiText.map.unavailable}
        </Text>
      </View>
      <View style={styles.badges}>
        {technician.isVerified ? <Badge label={uiText.map.verified} /> : null}
        {technician.isPro ? <Badge label={uiText.map.pro} /> : null}
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>★ {technician.rating}</Text>
        <Text style={styles.metric}>{technician.completedJobs} {uiText.map.jobs}</Text>
        <Text style={styles.metric}>{technician.distanceKm} {uiText.map.kilometers}</Text>
      </View>
      {children}
      <View style={styles.actions}>
        <View style={styles.action}><Button onPress={onProfile} variant="outlined">{uiText.map.profile}</Button></View>
        <View style={styles.action}><Button disabled={!technician.isAvailable} onPress={onRepairRequest}>{actionLabel}</Button></View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row-reverse", gap: spacing.sm },
  avatar: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, height: 48, justifyContent: "center", width: 48 },
  avatarText: { color: colors.neutral, fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  identity: { flex: 1 },
  name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: typography.size.md, fontWeight: typography.weight.bold, textAlign: "right" },
  specialty: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.xs, textAlign: "right", writingDirection: "rtl" },
  availability: { color: colors.tertiary, fontFamily: typography.fontFamily, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  unavailable: { color: colors.textMuted },
  badges: { flexDirection: "row-reverse", gap: spacing.xs, marginTop: spacing.sm },
  metrics: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.sm },
  metric: { color: colors.text, fontFamily: typography.fontFamily, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  actions: { flexDirection: "row-reverse", gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 }
});
