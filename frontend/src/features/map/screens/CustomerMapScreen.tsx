import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
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

  return (
    <View style={styles.screen}>
      <MapView initialRegion={jerusalemRegion} style={StyleSheet.absoluteFillObject}>
        <Marker coordinate={map.location} pinColor={colors.tertiary} title={map.location.label} />
        {map.technicians.map((technician) => (
          <Marker coordinate={technician.location} key={technician.id} onPress={() => map.selectTechnician(technician.id)}>
            <TechnicianMapMarker isSelected={map.selectedTechnician?.id === technician.id} technician={technician} />
          </Marker>
        ))}
      </MapView>

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
      ) : <View style={styles.preview}><Button onPress={() => navigation.navigate("CustomerRepairRequest", {})}>{uiText.map.repairRequest}</Button></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surface, flex: 1 },
  state: { ...shadows.subtle, alignSelf: "center", backgroundColor: colors.background, borderRadius: radius.md, marginTop: spacing.lg },
  empty: { ...shadows.subtle, alignSelf: "center", backgroundColor: colors.background, borderRadius: radius.md, margin: spacing.md, padding: spacing.md },
  emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: typography.size.sm, textAlign: "center", writingDirection: "rtl" },
  preview: { bottom: spacing.md, left: spacing.sm, position: "absolute", right: spacing.sm }
});
