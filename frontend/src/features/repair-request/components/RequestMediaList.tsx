import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { RequestMedia } from "../../../domain/models/repairRequest";
import { colors, radius, spacing } from "../../../shared/theme";
import { requestStyles } from "./RequestFields";

export function RequestMediaList({ media, onRemove, disabled }: { media: RequestMedia[]; onRemove?: (uri: string) => void; disabled?: boolean }) {
  return <View style={styles.list}>{media.map((item, index) => <View key={item.uri} style={styles.row}>
    {item.type === "image" ? <Image accessibilityLabel={`صورة العطل ${index + 1}`} source={{ uri: item.uri }} style={styles.image} /> :
      <Ionicons name="videocam-outline" size={32} color={colors.primaryPressed} />}
    <LocalizedText numberOfLines={2} style={[requestStyles.text, styles.name]}>{item.name ?? `${item.type === "image" ? "صورة" : "فيديو"} ${index + 1}`}</LocalizedText>
    {onRemove ? <Pressable accessibilityRole="button" accessibilityLabel={`حذف المرفق ${index + 1}`} disabled={disabled}
      onPress={() => onRemove(item.uri)} style={styles.remove}><Ionicons name="trash-outline" size={22} color={colors.danger} /></Pressable> : null}
  </View>)}</View>;
}

const styles = createAdaptiveStyleSheet({
  list: { gap: spacing.sm }, row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  image: { width: 64, height: 64, borderRadius: radius.sm }, name: { flex: 1 },
  remove: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }
});
