import { StyleSheet, Text, View } from "react-native";

import { calculateCustomerTotal, calculatePlatformFee, formatShekels } from "../constants/platformFee";
import { useI18n } from "../i18n/I18nProvider";
import { radius, spacing, typography, useTheme } from "../theme";

export function PlatformFeeBreakdown({ servicePrice, showTechnicianAmount = false }: { servicePrice: number; showTechnicianAmount?: boolean }) {
  const { t, isRTL } = useI18n();
  const { theme, textScale, isHighContrast } = useTheme();
  const rowDirection = isRTL ? "row-reverse" : "row";
  const fee = calculatePlatformFee(servicePrice);
  const rows = [
    [t("fee.servicePrice"), formatShekels(servicePrice)],
    [t("fee.platformFee"), formatShekels(fee)],
    ...(showTechnicianAmount ? [[t("fee.technicianGets"), formatShekels(servicePrice)]] : [])
  ];
  return <View accessibilityLabel={`${t("fee.total")} ${formatShekels(calculateCustomerTotal(servicePrice))}`} style={[styles.container, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderStrong, borderWidth: isHighContrast ? 2 : 1 }]}>
    {rows.map(([label, value]) => <View key={label} style={[styles.row, { flexDirection: rowDirection }]}><Text style={[styles.label, { color: theme.textSecondary, fontSize: 12 * textScale }]}>{label}</Text><Text style={[styles.value, { color: theme.text, fontSize: 12 * textScale }]}>{value}</Text></View>)}
    <View style={[styles.divider, { backgroundColor: theme.border }]} />
    <View style={[styles.row, { flexDirection: rowDirection }]}><Text style={[styles.totalLabel, { color: theme.text, fontSize: 14 * textScale }]}>{t("fee.total")}</Text><Text style={[styles.total, { color: theme.primaryPressed, fontSize: 17 * textScale }]}>{formatShekels(calculateCustomerTotal(servicePrice))}</Text></View>
    <Text style={[styles.explanation, { color: theme.textMuted, fontSize: 10 * textScale, textAlign: isRTL ? "right" : "left" }]}>{t("fee.explanation")}</Text>
  </View>;
}

const styles = StyleSheet.create({ container: { borderRadius: radius.lg, gap: 8, marginVertical: spacing.sm, padding: spacing.md }, row: { alignItems: "center", justifyContent: "space-between" }, label: { flex: 1, fontFamily: typography.fontFamily }, value: { fontFamily: typography.fontFamily, fontWeight: "700" }, divider: { height: 1, marginVertical: 2 }, totalLabel: { fontFamily: typography.fontFamily, fontWeight: "900" }, total: { fontFamily: typography.fontFamily, fontWeight: "900" }, explanation: { fontFamily: typography.fontFamily, lineHeight: 17, marginTop: 3 } });
