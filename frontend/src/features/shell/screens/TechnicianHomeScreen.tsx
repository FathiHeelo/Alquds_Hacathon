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
      <Card><Text style={styles.title}>طلب متاح: تسريب مياه — البلدة القديمة</Text><Text style={styles.title}>4.9 ★ · السعر العادل 110–150 ₪</Text><Button onPress={() => navigation.navigate("TechnicianRequestDetails", { requestId: "old_city_plumbing_leak" })}>عرض التفاصيل وإنشاء عرض</Button></Card>
      <Card>
        <View style={styles.actions}>
          <Button onPress={() => navigation.navigate("TechnicianProfile")} variant="outlined">{uiText.technician.profile}</Button>
          <Button onPress={() => navigation.navigate("TechnicianPro")} variant="secondary">{uiText.technician.pro}</Button>
          <Button onPress={() => navigation.navigate("TechnicianAiAssistant", { requestId: "old_city_plumbing_leak" })}>{uiText.technician.aiAssistant}</Button>
          <Button variant="outlined" onPress={() => navigation.navigate("TechnicianAiAssistant", { requestId: "old_city_plumbing_leak", isPro: false })}>عرض حالة الفني المجاني</Button>
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
