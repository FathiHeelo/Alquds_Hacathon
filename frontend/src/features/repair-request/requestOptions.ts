import { Urgency } from "../../domain/enums/status";
import { PreferredTime } from "../../domain/models/repairRequest";

export const urgencyOptions = [
  { id: Urgency.Low, label: "عادي" }, { id: Urgency.Medium, label: "مستعجل" }, { id: Urgency.High, label: "طارئ جداً" }
];
export const timeOptions = [
  { id: PreferredTime.Asap, label: "بأقرب وقت" }, { id: PreferredTime.Today, label: "اليوم" }, { id: PreferredTime.Tomorrow, label: "غداً" }
];
