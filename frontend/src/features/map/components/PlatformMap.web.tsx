import { createContext, useContext, type PropsWithChildren, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface PlatformMapProps {
  children?: ReactNode;
  initialRegion: MapRegion;
  onMarkerPress?(identifier?: string): void;
  onPress?(action?: string): void;
  style?: StyleProp<ViewStyle>;
  userInterfaceStyle?: "light" | "dark";
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
}

interface PlatformMarkerProps extends PropsWithChildren {
  accessibilityLabel?: string;
  anchor?: { x: number; y: number };
  coordinate: { latitude: number; longitude: number };
  identifier?: string;
  onPress?(): void;
  stopPropagation?: boolean;
}

const RegionContext = createContext<MapRegion | null>(null);

export function PlatformMap({ children, initialRegion, onPress, style, userInterfaceStyle }: PlatformMapProps) {
  const dark = userInterfaceStyle === "dark";
  return <RegionContext.Provider value={initialRegion}>
    <Pressable accessibilityLabel="Interactive map" onPress={() => onPress?.()} style={[styles.map, dark && styles.darkMap, style]}>
      <View pointerEvents="none" style={[styles.road, styles.roadOne, dark && styles.darkRoad]} />
      <View pointerEvents="none" style={[styles.road, styles.roadTwo, dark && styles.darkRoad]} />
      <View pointerEvents="none" style={[styles.road, styles.roadThree, dark && styles.darkRoad]} />
      {children}
    </Pressable>
  </RegionContext.Provider>;
}

export function PlatformMarker({ accessibilityLabel, children, coordinate, identifier, onPress }: PlatformMarkerProps) {
  const region = useContext(RegionContext);
  if (!region) return null;
  const left = Math.max(3, Math.min(97, 50 + ((coordinate.longitude - region.longitude) / region.longitudeDelta) * 100));
  const top = Math.max(3, Math.min(97, 50 - ((coordinate.latitude - region.latitude) / region.latitudeDelta) * 100));
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={(event) => { event.stopPropagation(); onPress?.(); }} style={[styles.marker, { left: `${left}%`, top: `${top}%` }]}>
    {children}
  </Pressable>;
}

const styles = StyleSheet.create({
  map: { backgroundColor: "#F4F0E7", overflow: "hidden" },
  darkMap: { backgroundColor: "#26322D" },
  road: { backgroundColor: "#FFFFFF", height: 8, opacity: 0.9, position: "absolute", width: "150%" },
  darkRoad: { backgroundColor: "#64706B", opacity: 0.45 },
  roadOne: { left: "-20%", top: "28%", transform: [{ rotate: "-12deg" }] },
  roadTwo: { left: "-15%", top: "61%", transform: [{ rotate: "8deg" }] },
  roadThree: { left: "18%", top: "48%", transform: [{ rotate: "74deg" }] },
  marker: { position: "absolute", transform: [{ translateX: -22 }, { translateY: -22 }], zIndex: 2 }
});
