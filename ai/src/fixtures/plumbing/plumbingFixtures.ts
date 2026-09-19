import type {
  RepairCategory,
  TechnicianType,
  Urgency,
} from "../../contracts/ai.types";

export const plumbingVoiceFixture = {
  category: "plumbing" as RepairCategory,
  technicianType: "plumber" as TechnicianType,
  urgency: "high" as Urgency,

  keywords: [
    "leak",
    "water",
    "sink",
    "faucet",
    "pipe",
    "مجلى",
    "مية",
    "مي",
    "ماء",
    "ماسورة",
    "حنفية",
  ],

  extractedKeywordMap: {
    leak: ["leak", "water", "مي", "ماء"],
    sink: ["sink", "مجلى"],
  },
} as const;