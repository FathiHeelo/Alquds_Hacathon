import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { Button, Card, ScreenContainer } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, spacing, typography } from "../../../shared/theme";

export function TechnicianHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TechnicianStackParamList>>();

  return (
    <ScreenContainer>
      <Text style={styles.title}>{uiText.technician.requests}</Text>
      <Card>
        <View style={styles.actions}>
          <Button onPress={() => navigation.navigate("TechnicianProfile")} variant="outlined">{uiText.technician.profile}</Button>
          <Button onPress={() => navigation.navigate("TechnicianPro")} variant="secondary">{uiText.technician.pro}</Button>
          <Button onPress={() => navigation.navigate("TechnicianAiAssistant")}>{uiText.technician.aiAssistant}</Button>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    textAlign: "right",
    writingDirection: "rtl"
  },
  actions: { gap: spacing.sm }
});
