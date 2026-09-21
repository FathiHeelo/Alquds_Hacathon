import { defaultPreferences, type AccessibilityPreferences } from "./types";

const appearanceModes = new Set<AccessibilityPreferences["appearance"]>(["light", "dark", "high_contrast", "system"]);
const languages = new Set<AccessibilityPreferences["language"]>(["ar", "en"]);
const textSizes = new Set<AccessibilityPreferences["textSize"]>(["normal", "large"]);

export function parseStoredPreferences(value: string | null): AccessibilityPreferences {
  if (!value) return defaultPreferences;
  try {
    const stored = JSON.parse(value) as unknown;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaultPreferences;
    const candidate = stored as Partial<AccessibilityPreferences>;
    return {
      appearance: candidate.appearance && appearanceModes.has(candidate.appearance) ? candidate.appearance : defaultPreferences.appearance,
      language: candidate.language && languages.has(candidate.language) ? candidate.language : defaultPreferences.language,
      textSize: candidate.textSize && textSizes.has(candidate.textSize) ? candidate.textSize : defaultPreferences.textSize,
      reduceMotion: typeof candidate.reduceMotion === "boolean" ? candidate.reduceMotion : defaultPreferences.reduceMotion
    };
  } catch {
    return defaultPreferences;
  }
}
