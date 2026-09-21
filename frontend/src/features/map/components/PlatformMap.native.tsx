import type { PropsWithChildren, ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import MapView, { Marker } from "react-native-maps";

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

export function PlatformMap({ children, onMarkerPress, onPress, ...props }: PlatformMapProps) {
  return <MapView {...props}
    onMarkerPress={(event) => onMarkerPress?.(event.nativeEvent.id)}
    onPress={(event) => onPress?.(event.nativeEvent.action)}>
    {children}
  </MapView>;
}

export function PlatformMarker(props: PlatformMarkerProps) {
  return <Marker {...props} />;
}
