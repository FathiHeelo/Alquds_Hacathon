import * as Location from "expo-location";

import { appConfig } from "../../app/config/appConfig";
import type { CustomerLocation } from "../../domain/models/location";

export const jerusalemDemoLocation: CustomerLocation = {
  latitude: 31.7834,
  longitude: 35.2304,
  label: "شارع صلاح الدين، القدس",
  source: "demo"
};

export async function getCustomerLocation(): Promise<CustomerLocation | undefined> {
  if (appConfig.demoMode) return jerusalemDemoLocation;
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return jerusalemDemoLocation;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      label: "موقعك الحالي",
      source: "device"
    };
  } catch {
    return jerusalemDemoLocation;
  }
}
