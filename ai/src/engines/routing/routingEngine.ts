import type { DiagnosisAnswer, RoutingRecommendation } from "../../contracts/diagnosis.types";
import type { RepairCategory, Urgency } from "../../contracts/ai.types";

const includesAny = (text: string, terms: readonly string[]) => terms.some((term) => text.includes(term));

export function recommendAssistance(input: {
  description: string;
  category: RepairCategory;
  urgency: Urgency;
  answers?: readonly DiagnosisAnswer[];
}): RoutingRecommendation {
  const text = `${input.description} ${(input.answers ?? []).map(({ value }) => value).join(" ")}`.toLowerCase();
  const fire = includesAny(text, ["fire", "flame", "burning", "حريق", "نار", "لهب"]);
  const smokeOrSparks = includesAny(text, ["smoke", "spark", "دخان", "شرار", "شرارة"]);
  const lifeThreat = includesAny(text, ["unconscious", "not breathing", "severe injury", "فاقد الوعي", "لا يتنفس", "إصابة خطيرة"]);
  if (fire) return { type: "EMERGENCY_SERVICE", reasonCode: "fire_immediate_danger", assistanceCategory: "fire_emergency", contactConfigKey: "fire_emergency", safetyInstructionCodes: ["leave_area", "do_not_reenter"] };
  if (lifeThreat) return { type: "EMERGENCY_SERVICE", reasonCode: "medical_immediate_danger", assistanceCategory: "medical_emergency", contactConfigKey: "medical_emergency", safetyInstructionCodes: ["move_to_safety"] };
  if (input.category === "electrical" && smokeOrSparks) return { type: "EMERGENCY_SERVICE", reasonCode: "electrical_immediate_danger", assistanceCategory: "electrical_emergency", contactConfigKey: "fire_emergency", safetyInstructionCodes: ["cut_power_if_safe", "avoid_water_contact", "leave_area"] };

  if (includesAny(text, ["water main", "public sewer", "street pipe", "municipality", "خط مياه رئيسي", "صرف عام", "ماسورة الشارع", "البلدية"])) {
    return { type: "PUBLIC_SERVICE", reasonCode: "public_infrastructure", assistanceCategory: includesAny(text, ["water", "مياه", "ماسورة"]) ? "water_utility" : "municipal_service", contactConfigKey: includesAny(text, ["water", "مياه", "ماسورة"]) ? "water_utility" : "municipal_service", safetyInstructionCodes: ["keep_distance"] };
  }
  if (includesAny(text, ["shelter", "homeless", "social support", "مأوى", "بلا مأوى", "مساعدة اجتماعية", "إيواء"])) {
    return { type: "SOCIAL_ASSISTANCE", reasonCode: "social_support_needed", assistanceCategory: "social_support", contactConfigKey: "social_support", safetyInstructionCodes: [] };
  }

  const urgentMaintenance = input.urgency === "high" || includesAny(text, ["burst pipe", "flooding", "heavy leak", "ماسورة انفجرت", "غرق", "تسريب غزير"]);
  if (urgentMaintenance) return { type: "URGENT_TECHNICIAN", reasonCode: "urgent_maintenance", safetyInstructionCodes: input.category === "plumbing" ? ["shut_water_if_safe"] : [] };
  return { type: "NORMAL_TECHNICIAN", reasonCode: "normal_maintenance", safetyInstructionCodes: [] };
}
