import { parseStoredPreferences } from "./preferencesStorage.shared";
import { defaultPreferences, type AccessibilityPreferences } from "./types";

const storageKey = "ammerha.accessibility.preferences.v1";

function webStorage(): Storage | undefined {
  try { return typeof window !== "undefined" ? window.localStorage : undefined; } catch { return undefined; }
}

export async function loadPreferences(): Promise<AccessibilityPreferences> {
  try {
    const storage = webStorage();
    return storage ? parseStoredPreferences(storage.getItem(storageKey)) : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: AccessibilityPreferences): Promise<void> {
  try { webStorage()?.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Preferences remain active for this session. */ }
}
