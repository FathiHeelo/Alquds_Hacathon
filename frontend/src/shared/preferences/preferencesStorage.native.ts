import { File, Paths } from "expo-file-system";

import { parseStoredPreferences } from "./preferencesStorage.shared";
import { defaultPreferences, type AccessibilityPreferences } from "./types";

const preferenceFile = new File(Paths.document, "ammerha-accessibility-preferences.json");

export async function loadPreferences(): Promise<AccessibilityPreferences> {
  try {
    if (!preferenceFile.exists) return defaultPreferences;
    return parseStoredPreferences(await preferenceFile.text());
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: AccessibilityPreferences): Promise<void> {
  try { preferenceFile.write(JSON.stringify(preferences)); } catch { /* Preferences remain active for this session. */ }
}
