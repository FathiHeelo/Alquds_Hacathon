import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { loadPreferences, savePreferences } from "./preferencesStorage";
import { defaultPreferences, type AccessibilityPreferences } from "./types";

interface PreferencesContextValue {
  preferences: AccessibilityPreferences;
  ready: boolean;
  updatePreferences(update: Partial<AccessibilityPreferences>): void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function AccessibilityPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  useEffect(() => { let active = true; void loadPreferences().then((stored) => { if (active) { setPreferences(stored); setReady(true); } }); return () => { active = false; }; }, []);
  const value = useMemo(() => ({ preferences, ready, updatePreferences(update: Partial<AccessibilityPreferences>) { setPreferences((current) => { const next = { ...current, ...update }; void savePreferences(next); return next; }); } }), [preferences, ready]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAccessibilityPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useAccessibilityPreferences must be used inside AccessibilityPreferencesProvider");
  return context;
}
