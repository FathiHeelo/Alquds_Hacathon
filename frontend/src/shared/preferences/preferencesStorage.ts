import { File, Paths } from "expo-file-system";

import { defaultPreferences, type AccessibilityPreferences } from "./types";

const preferenceFile = new File(Paths.document, "ammerha-accessibility-preferences.json");

export async function loadPreferences(): Promise<AccessibilityPreferences> {
  try {
    if (!preferenceFile.exists) return defaultPreferences;
    const stored = JSON.parse(await preferenceFile.text()) as Partial<AccessibilityPreferences>;
    return { ...defaultPreferences, ...stored };
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: AccessibilityPreferences): Promise<void> {
  try { preferenceFile.write(JSON.stringify(preferences)); } catch { /* Preferences remain active for this session. */ }
}
