export type AppearanceMode = "light" | "dark" | "high_contrast" | "system";
export type AppLanguage = "ar" | "en";
export type TextSizePreference = "normal" | "large";

export interface AccessibilityPreferences {
  appearance: AppearanceMode;
  language: AppLanguage;
  textSize: TextSizePreference;
  reduceMotion: boolean;
}

export const defaultPreferences: AccessibilityPreferences = {
  appearance: "light",
  language: "ar",
  textSize: "normal",
  reduceMotion: false
};
