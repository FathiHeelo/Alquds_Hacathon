import { defaultPreferences, type AccessibilityPreferences } from "./types";

export async function loadPreferences(): Promise<AccessibilityPreferences> {
  return defaultPreferences;
}

export async function savePreferences(_preferences: AccessibilityPreferences): Promise<void> {
  // Expo resolves the native or web implementation on supported platforms.
}
