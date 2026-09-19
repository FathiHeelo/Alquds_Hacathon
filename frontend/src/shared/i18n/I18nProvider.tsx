import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

import { useAccessibilityPreferences } from "../preferences/AccessibilityPreferencesProvider";
import { ar } from "./resources/ar";
import { en } from "./resources/en";
import { setAdaptiveDirection } from "../theme/adaptiveStyles";

type Primitive = string | number;
const resources = { ar, en } as const;
type TranslationParams = Record<string, Primitive>;

function resolve(object: unknown, key: string): string | undefined { return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined, object) as string | undefined; }

interface I18nValue { language: "ar" | "en"; isRTL: boolean; t(key: string, params?: TranslationParams): string; }
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const { preferences } = useAccessibilityPreferences();
  const value = useMemo<I18nValue>(() => ({ language: preferences.language, isRTL: preferences.language === "ar", t(key, params) { const template = resolve(resources[preferences.language], key) ?? resolve(resources.ar, key) ?? key; return Object.entries(params ?? {}).reduce((text, [name, replacement]) => text.replaceAll(`{{${name}}}`, String(replacement)), template); } }), [preferences.language]);
  setAdaptiveDirection(value.isRTL);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() { const context = useContext(I18nContext); if (!context) throw new Error("useI18n must be used inside I18nProvider"); return context; }
