import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminHomeScreen } from "../../features/shell/screens/AdminHomeScreen";
import { AdminQueueScreen } from "../../features/admin/screens/AdminQueueScreen";
import { uiText } from "../../shared/constants/uiText";
import { colors, typography } from "../../shared/theme";
import type { AdminStackParamList } from "./navigation.types";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleAlign: "center",
        headerTitleStyle: { fontFamily: typography.fontFamily, fontWeight: typography.weight.bold }
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminHomeScreen} options={{ title: uiText.admin.title }} />
      <Stack.Screen name="AdminVerification" options={{ title: uiText.admin.verification }}>{() => <AdminQueueScreen kind="verification" />}</Stack.Screen>
      <Stack.Screen name="AdminReports" options={{ title: uiText.admin.reports }}>{() => <AdminQueueScreen kind="reports" />}</Stack.Screen>
      <Stack.Screen name="AdminRisk" options={{ title: uiText.admin.risk }}>{() => <AdminQueueScreen kind="risk" />}</Stack.Screen>
    </Stack.Navigator>
  );
}
