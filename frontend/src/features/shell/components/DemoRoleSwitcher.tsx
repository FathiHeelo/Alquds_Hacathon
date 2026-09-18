import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { UserRole, type UserRole as UserRoleValue } from "../../../domain/enums/status";
import { uiText } from "../../../shared/constants/uiText";
import { colors, radius, spacing, typography } from "../../../shared/theme";

const roles: ReadonlyArray<{ role: UserRoleValue; label: string }> = [
  { role: UserRole.Customer, label: uiText.demo.customer },
  { role: UserRole.Technician, label: uiText.demo.technician },
  { role: UserRole.Admin, label: uiText.demo.admin }
];

export function DemoRoleSwitcher() {
  const { role: activeRole, switchRole } = useDemoSession();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>{uiText.brand}</Text>
        <View accessibilityLabel={uiText.demo.label} style={styles.switcher}>
          {roles.map(({ label, role }) => {
            const active = activeRole === role;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={role}
                onPress={() => switchRole(role)}
                style={[styles.option, active && styles.activeOption]}
              >
                <Text style={[styles.optionLabel, active && styles.activeLabel]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.secondary },
  header: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  brand: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    textAlign: "right"
  },
  switcher: {
    backgroundColor: colors.neutral,
    borderRadius: radius.md,
    flexDirection: "row-reverse",
    padding: spacing.xs
  },
  option: { alignItems: "center", borderRadius: radius.sm, flex: 1, minHeight: 36, justifyContent: "center" },
  activeOption: { backgroundColor: colors.primary },
  optionLabel: { color: colors.invertedText, fontFamily: typography.fontFamily, fontSize: typography.size.sm },
  activeLabel: { color: colors.neutral, fontWeight: typography.weight.bold }
});
