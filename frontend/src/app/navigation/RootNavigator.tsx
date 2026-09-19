import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { UserRole } from "../../domain/enums/status";
import { RoleLoginScreen } from "../../features/auth/screens/RoleLoginScreen";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { useTheme } from "../../shared/theme";
import { useDemoSession } from "../providers/DemoSessionProvider";
import { AdminNavigator } from "./AdminNavigator";
import { CustomerNavigator } from "./CustomerNavigator";
import { createNavigationTheme } from "./navigationTheme";
import { TechnicianNavigator } from "./TechnicianNavigator";

export function RootNavigator() {
  const { role } = useDemoSession();
  const { isRTL } = useI18n();
  const { theme } = useTheme();

  if (!role) return <RoleLoginScreen />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationContainer direction={isRTL ? "rtl" : "ltr"} key={role} theme={createNavigationTheme(theme)}>
        {role === UserRole.Customer ? <CustomerNavigator /> : null}
        {role === UserRole.Technician ? <TechnicianNavigator /> : null}
        {role === UserRole.Admin ? <AdminNavigator /> : null}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
