export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CustomerLocation extends GeoPoint {
  label: string;
  source: "device" | "demo";
}
