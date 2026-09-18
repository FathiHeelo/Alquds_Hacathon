import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Animated, Keyboard, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import MapView, { Marker, type Region } from "react-native-maps";
import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { UserRole } from "../../../domain/enums/status";
import { ErrorState, LoadingState } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, shadows, typography } from "../../../shared/theme";
import { MapControls } from "../components/MapControls";
import { TechnicianMapMarker } from "../components/TechnicianMapMarker";
import { TechnicianPreview } from "../components/TechnicianPreview";
import { useCustomerMap } from "../hooks/useCustomerMap";

type MapNavigation = CompositeNavigationProp<BottomTabNavigationProp<CustomerTabParamList, "CustomerMap">, NativeStackNavigationProp<CustomerStackParamList>>;
const jerusalemRegion: Region = { latitude: 31.7834, longitude: 35.2304, latitudeDelta: 0.035, longitudeDelta: 0.028 };

export function CustomerMapScreen() {
  const navigation = useNavigation<MapNavigation>();
  const map = useCustomerMap();
  const { switchRole } = useDemoSession();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const markerPressAt = useRef(0);
  const initialSelectionMade = useRef(false);
  const bottomSpace = Math.min(80, Math.max(12, height * 0.09));
  useEffect(() => {
    if (!initialSelectionMade.current && !map.isLoading && map.technicians.length) {
      initialSelectionMade.current = true;
      map.selectTechnician(map.technicians[0].id);
    }
  }, [map.isLoading, map.technicians, map.selectTechnician]);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 950, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  useEffect(() => {
    cardAnimation.setValue(0);
    if (map.selectedTechnician) Animated.timing(cardAnimation, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [map.selectedTechnician?.id, cardAnimation]);
  const requestRepair = () => navigation.navigate("CustomerRepairRequest", { technicianId: map.selectedTechnician?.id });

  return (
    <View style={styles.screen}>
      <MapView ref={mapRef} initialRegion={jerusalemRegion} style={styles.map} userInterfaceStyle="light"
        onPress={(event) => {
          if (event.nativeEvent.action === "marker-press" || Date.now() - markerPressAt.current < 300) return;
          Keyboard.dismiss();
          map.selectTechnician(undefined);
        }}>
        <Marker coordinate={map.location} anchor={{ x: 0.5, y: 0.42 }}>
          <View style={styles.locationWrap}>
            <View style={styles.locationTarget}>
              <Animated.View style={[styles.halo, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]} />
              <View style={styles.locationDot}><View style={styles.locationCore} /></View>
            </View>
            <Text style={styles.locationLabel}>موقعك: {map.location.label}</Text>
          </View>
        </Marker>
        {map.technicians.map((technician) => <Marker coordinate={technician.location} key={technician.id} stopPropagation anchor={{ x: 0.5, y: 0.4 }}
          onPress={() => { markerPressAt.current = Date.now(); Keyboard.dismiss(); map.selectTechnician(technician.id); }}>
          <TechnicianMapMarker isSelected={map.selectedTechnician?.id === technician.id} technician={technician} />
        </Marker>)}
      </MapView>
      <View pointerEvents="box-none" style={[styles.controls, { paddingTop: insets.top + 10 }]}>
        <MapControls filters={map.filters} location={map.location} resultCount={map.technicians.length}
          onNotifications={() => navigation.navigate("CustomerNotifications")}
          onTechnicianMode={() => switchRole(UserRole.Technician)} onVoice={requestRepair}
          setAvailableOnly={map.setAvailableOnly} setCategoryId={map.setCategoryId}
          setMaximumDistanceKm={map.setMaximumDistanceKm} setMinimumRating={map.setMinimumRating} setQuery={map.setQuery} />
      </View>
      {map.isLoading ? <View style={styles.state}><LoadingState /></View> : null}
      {map.error ? <View style={styles.state}><ErrorState onRetry={map.retry} /></View> : null}
      {!map.isLoading && !map.error && !map.technicians.length ? <View style={styles.state}><Text style={styles.empty}>{uiText.map.noResults}</Text></View> : null}
      <View pointerEvents="box-none" style={[styles.bottom, { bottom: bottomSpace }]}>
        {map.selectedTechnician ? <Animated.View style={{ opacity: cardAnimation, transform: [{ translateY: cardAnimation.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
          <TechnicianPreview onDismiss={() => map.selectTechnician(undefined)}
            onProfile={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: map.selectedTechnician!.id })}
            onRepairRequest={requestRepair} technician={map.selectedTechnician} />
        </Animated.View> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="احكِ المشكلة بصوتك أو صوّرها" onPress={requestRepair} style={({ pressed }) => [styles.aiCta, pressed && styles.pressed]}>
          <View style={styles.mic}><Ionicons color="white" name="mic" size={18} /></View>
          <View style={styles.copy}><Text style={styles.title}>احكِ المشكلة بصوتك أو صوّرها</Text><Text style={styles.subtitle}>الذكاء الاصطناعي يشخّص العطل ويقترح السعر العادل فوراً</Text></View>
          <Ionicons color={colors.primary} name="arrow-back" size={19} />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAF9F6" },
  map: { position: "absolute", left: 0, right: 0, top: 0 },
  controls: { zIndex: 20 },
  state: { ...shadows.subtle, backgroundColor: "white", borderRadius: 14, margin: 12 },
  empty: { padding: 14, textAlign: "center", color: colors.textMuted },
  bottom: { position: "absolute", left: 12, right: 12, gap: 8, zIndex: 25 },
  aiCta: { ...shadows.raised, direction: "ltr", flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 14, minHeight: 58, backgroundColor: "#16231D", borderRadius: 14 },
  mic: { width: 32, height: 36, backgroundColor: colors.primary, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  title: { color: "white", fontSize: 12, fontWeight: "700", fontFamily: typography.fontFamily, textAlign: "right", writingDirection: "rtl" },
  subtitle: { color: "#DDC04A", fontSize: 9, lineHeight: 14, fontFamily: typography.fontFamily, textAlign: "right", writingDirection: "rtl" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  locationWrap: { width: 170, height: 74, alignItems: "center" },
  locationTarget: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 50, height: 50, borderRadius: 25, backgroundColor: "#3B82F6" },
  locationDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#2F6FE4", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#B7D0FF" },
  locationCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: "white" },
  locationLabel: { ...shadows.subtle, backgroundColor: "white", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, fontFamily: typography.fontFamily, fontSize: 9, color: "#475569", textAlign: "center" }
});
