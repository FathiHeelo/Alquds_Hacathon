import type {
  RepairCategory,
  TechnicianType,
  Urgency,
} from "../../contracts/ai.types";

export const applianceVoiceFixture = {
  category: "appliance" as RepairCategory,
  technicianType: "appliance_technician" as TechnicianType,
  urgency: "medium" as Urgency,

  keywords: [
    "washing machine",
    "washer",
    "fridge",
    "refrigerator",
    "غسالة",
    "ثلاجة",
  ],

  extractedKeywordMap: {
    leak: [
      "leak",
      "مي",
      "ماء",
    ],
  },
} as const;