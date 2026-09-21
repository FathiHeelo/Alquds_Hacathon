import type {
  RepairCategory,
  TechnicianType,
  Urgency,
} from "../../contracts/ai.types";

export const acVoiceFixture = {
  category: "ac" as RepairCategory,
  technicianType: "ac_technician" as TechnicianType,
  urgency: "medium" as Urgency,

  keywords: [
    "air conditioner",
    "air conditioning",
    "ac",
    "cooling",
    "not cooling",
    "مكيف",
    "تبريد",
    "بارد",
  ],

  extractedKeywordMap: {
    cooling: [
      "cooling",
      "not cooling",
      "تبريد",
      "بارد",
    ],
  },
} as const;