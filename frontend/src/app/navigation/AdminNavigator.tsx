import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminAuditScreen } from "../../features/admin/screens/AdminAuditScreen";
import { AdminCaseDetailsScreen } from "../../features/admin/screens/AdminCaseDetailsScreen";
import { AdminFinanceScreen } from "../../features/admin/screens/AdminFinanceScreen";
import { AdminQueueScreen } from "../../features/admin/screens/AdminQueueScreen";
import { AdminUsersScreen } from "../../features/admin/screens/AdminUsersScreen";
import { AdminHomeScreen } from "../../features/shell/screens/AdminHomeScreen";
import type { AdminStackParamList } from "./navigation.types";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminHomeScreen} />
    <Stack.Screen name="AdminVerification">{() => <AdminQueueScreen kind="verification" />}</Stack.Screen>
    <Stack.Screen name="AdminReports">{() => <AdminQueueScreen kind="reports" />}</Stack.Screen>
    <Stack.Screen name="AdminRisk">{() => <AdminQueueScreen kind="risk" />}</Stack.Screen>
    <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminAudit" component={AdminAuditScreen} />
    <Stack.Screen name="AdminCaseDetails" component={AdminCaseDetailsScreen} />
  </Stack.Navigator>;
}
