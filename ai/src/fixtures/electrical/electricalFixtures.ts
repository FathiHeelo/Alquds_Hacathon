import type {
  RepairCategory,
  TechnicianType,
  Urgency,
} from "../../contracts/ai.types";

export const electricalVoiceFixture = {
  category: "electrical" as RepairCategory,
  technicianType: "electrician" as TechnicianType,
  urgency: "medium" as Urgency,

  keywords: [
    "electrical",
    "electric",
    "outlet",
    "socket",
    "plug",
    "electricity",
    "كهرب",
    "فيشة",
    "مقبس",
    "قاطع",
  ],

  extractedKeywordMap: {
    outlet: [
      "outlet",
      "socket",
      "plug",
      "مقبس",
      "فيشة",
    ],
  },
} as const;