import { StyleSheet, Text, View } from "react-native";

import { Button, Card, ScreenContainer } from "../../../shared/components";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "../../../app/navigation/navigation.types";
import { uiText } from "../../../shared/constants/uiText";
import { colors, spacing, typography } from "../../../shared/theme";

const entries = [
  uiText.admin.verification,
  uiText.admin.reports,
  uiText.admin.risk,
  uiText.admin.summary
] as const;

export function AdminHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {entries.map((entry) => (
          <Card key={entry}>
            <Text style={styles.label}>{entry}</Text>
            <Button variant="outlined" onPress={() => entry === uiText.admin.verification ? navigation.navigate("AdminVerification") : entry === uiText.admin.reports ? navigation.navigate("AdminReports") : entry === uiText.admin.risk ? navigation.navigate("AdminRisk") : undefined}>فتح</Button>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    textAlign: "right",
    writingDirection: "rtl"
  }
});
