import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import MapView, { Marker, type Region } from "react-native-maps";

import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { Button, ErrorState, LoadingState } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { MapControls } from "../components/MapControls";
import { TechnicianMapMarker } from "../components/TechnicianMapMarker";
import { TechnicianPreview } from "../components/TechnicianPreview";
import { useCustomerMap } from "../hooks/useCustomerMap";

type MapNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, "CustomerMap">,
  NativeStackNavigationProp<CustomerStackParamList>
>;

const jerusalemRegion: Region = {
  latitude: 31.7834,
  latitudeDelta: 0.055,
  longitude: 35.2304,
  longitudeDelta: 0.045
};

export function CustomerMapScreen() {
  const navigation = useNavigation<MapNavigation>();
  const map = useCustomerMap();
  const insets = useSafeAreaInsets();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const toggleQuickActions = () => {
    const next = quickActionsOpen ? 0 : 1;
    setQuickActionsOpen(!quickActionsOpen);
    Animated.spring(animation, { toValue: next, useNativeDriver: true, damping: 18, stiffness: 180, mass: 0.7 }).start();
  };
  const closeQuickActions = () => {
    setQuickActionsOpen(false);
    Animated.spring(animation, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180, mass: 0.7 }).start();
  };

  return (
    <View style={styles.screen}>
      <MapView initialRegion={jerusalemRegion} style={styles.map}>
        <Marker coordinate={map.location} pinColor={colors.tertiary} title={map.location.label} />
        {map.technicians.map((technician) => (
          <Marker coordinate={technician.location} key={technician.id} onPress={() => map.selectTechnician(technician.id)}>
            <TechnicianMapMarker isSelected={map.selectedTechnician?.id === technician.id} technician={technician} />
          </Marker>
        ))}
      </MapView>

      <View style={[styles.controls, { paddingTop: insets.top + spacing.sm }]}>
        <MapControls
          filters={map.filters}
          location={map.location}
          resultCount={map.technicians.length}
          setAvailableOnly={map.setAvailableOnly}
          setCategoryId={map.setCategoryId}
          setMaximumDistanceKm={map.setMaximumDistanceKm}
          setMinimumRating={map.setMinimumRating}
          setQuery={map.setQuery}
        />
      </View>

      {map.isLoading ? <View style={styles.state}><LoadingState /></View> : null}
      {map.error ? <View style={styles.state}><ErrorState onRetry={map.retry} /></View> : null}
      {!map.isLoading && !map.error && map.technicians.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>{uiText.map.noResults}</Text></View>
      ) : null}

      {map.selectedTechnician ? (
        <View style={styles.preview}>
          <TechnicianPreview
            onProfile={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: map.selectedTechnician!.id })}
            onRepairRequest={() => navigation.navigate("CustomerRepairRequest", { technicianId: map.selectedTechnician!.id })}
            technician={map.selectedTechnician}
          />
        </View>
      ) : null}

      <View pointerEvents="box-none" style={[styles.quickActions, { bottom: Math.max(insets.bottom + 70, 86) }]}>
        <Animated.View pointerEvents={quickActionsOpen ? "auto" : "none"} style={[styles.actionStack, { opacity: animation, transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] }]}>
          <Pressable accessibilityRole="button" onPress={() => { closeQuickActions(); navigation.navigate("CustomerRepairRequest", {}); }} style={styles.quickAction}>
            <Ionicons color={colors.neutral} name="construct-outline" size={18} />
            <Text style={styles.quickActionLabel}>طلب صيانة</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => { closeQuickActions(); map.retry(); }} style={styles.quickAction}>
            <Ionicons color={colors.neutral} name="refresh-outline" size={18} />
            <Text style={styles.quickActionLabel}>تحديث الفنيين</Text>
          </Pressable>
        </Animated.View>
        <Pressable accessibilityLabel={quickActionsOpen ? "إغلاق الإجراءات السريعة" : "فتح الإجراءات السريعة"} accessibilityRole="button" onPress={toggleQuickActions} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Animated.View style={{ transform: [{ rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] }) }] }}><Ionicons color={colors.neutral} name="add" size={30} /></Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surface, flex: 1 },
  map: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  controls: { backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: 1, zIndex: 20 },
  state: { ...shadows.subtle, alignSelf: "center", backgroundColor: colors.background, borderRadius: radius.md, marginTop: spacing.lg },
  empty: { ...shadows.subtle, alignSelf: "center", backgroundColor: colors.background, borderRadius: radius.md, margin: spacing.md, padding: spacing.md },
  emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.sm, textAlign: "center", writingDirection: "rtl" },
  preview: { bottom: spacing.md, left: spacing.sm, position: "absolute", right: spacing.sm, zIndex: 25 },
  quickActions: { alignItems: "center", left: 0, position: "absolute", right: 0 },
  actionStack: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  quickAction: { ...shadows.raised, alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row-reverse", gap: spacing.sm, minHeight: 46, paddingHorizontal: spacing.md },
  quickActionLabel: { color: colors.text, fontFamily: typography.fontFamily, fontSize: typography.size.sm, fontWeight: typography.weight.bold, writingDirection: "rtl" },
  fab: { ...shadows.raised, alignItems: "center", backgroundColor: colors.primary, borderColor: colors.background, borderRadius: radius.round, borderWidth: 3, height: 62, justifyContent: "center", width: 62 },
  fabPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.94 }] }
});
