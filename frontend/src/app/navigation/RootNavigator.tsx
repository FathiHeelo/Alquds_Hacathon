import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { UserRole } from "../../domain/enums/status";
import { DemoRoleSwitcher } from "../../features/shell/components/DemoRoleSwitcher";
import { colors } from "../../shared/theme";
import { useDemoSession } from "../providers/DemoSessionProvider";
import { AdminNavigator } from "./AdminNavigator";
import { CustomerNavigator } from "./CustomerNavigator";
import { navigationTheme } from "./navigationTheme";
import { TechnicianNavigator } from "./TechnicianNavigator";

export function RootNavigator() {
  const { isDemo, role } = useDemoSession();

  return (
    <View style={styles.container}>
      {isDemo && role !== UserRole.Customer ? <DemoRoleSwitcher /> : null}
      <NavigationContainer direction="rtl" key={role} theme={navigationTheme}>
        {role === UserRole.Customer ? <CustomerNavigator /> : null}
        {role === UserRole.Technician ? <TechnicianNavigator /> : null}
        {role === UserRole.Admin ? <AdminNavigator /> : null}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 }
});
