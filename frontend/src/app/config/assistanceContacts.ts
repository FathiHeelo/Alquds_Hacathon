import type { AssistanceCategory } from "@ammerha/ai";

const configuredPhones: Partial<Record<AssistanceCategory, string | undefined>> = {
  fire_emergency: process.env.EXPO_PUBLIC_FIRE_EMERGENCY_PHONE,
  medical_emergency: process.env.EXPO_PUBLIC_MEDICAL_EMERGENCY_PHONE,
  electrical_emergency: process.env.EXPO_PUBLIC_FIRE_EMERGENCY_PHONE,
  water_utility: process.env.EXPO_PUBLIC_WATER_UTILITY_PHONE,
  municipal_service: process.env.EXPO_PUBLIC_MUNICIPAL_SERVICE_PHONE,
  social_support: process.env.EXPO_PUBLIC_SOCIAL_SUPPORT_PHONE
};

const labels: Record<AssistanceCategory, { ar: string; en: string }> = {
  fire_emergency: { ar: "خدمة الإطفاء والطوارئ", en: "Fire and emergency service" },
  medical_emergency: { ar: "خدمة الإسعاف والطوارئ", en: "Medical emergency service" },
  electrical_emergency: { ar: "خدمة طوارئ الخطر الكهربائي", en: "Electrical emergency service" },
  water_utility: { ar: "جهة خدمات المياه", en: "Water utility" },
  municipal_service: { ar: "جهة الخدمات البلدية", en: "Municipal service" },
  social_support: { ar: "جهة المساعدة الاجتماعية", en: "Social assistance service" }
};

export function getVerifiedAssistanceContact(category: AssistanceCategory | undefined, language: "ar" | "en") {
  if (!category) return undefined;
  const phone = configuredPhones[category]?.trim();
  if (!phone || !/^\+?[0-9][0-9 -]{4,18}$/.test(phone)) return undefined;
  return { phone, label: labels[category][language] };
}
