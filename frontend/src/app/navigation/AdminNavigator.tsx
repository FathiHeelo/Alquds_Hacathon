import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminHomeScreen } from "../../features/shell/screens/AdminHomeScreen";
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
    </Stack.Navigator>
  );
}
