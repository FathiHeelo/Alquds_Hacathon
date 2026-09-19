export type TechnicianRequestState = "new" | "viewed" | "offered";

export interface TechnicianRequestItem {
  id: string;
  customerName: string;
  problem: string;
  category: string;
  area: string;
  distanceKm: number;
  fairPrice: string;
  urgency: "عاجل" | "اليوم" | "عادي";
  createdAt: string;
  latitude: number;
  longitude: number;
  description: string;
  state: TechnicianRequestState;
}

export const technicianRequests: readonly TechnicianRequestItem[] = [
  { id: "old_city_plumbing_leak", customerName: "أحمد", problem: "تسريب سيفون تحت المجلى", category: "سباكة وصحية", area: "البلدة القديمة", distanceKm: 0.8, fairPrice: "110–150 ₪", urgency: "عاجل", createdAt: "منذ دقيقتين", latitude: 31.7807, longitude: 35.2326, description: "المي بتنقط بغزارة من تحت مجلى المطبخ عند فتح الحنفية، والماسورة البلاستيك تبدو مشقوقة.", state: "new" },
  { id: "wadi_joz_ac", customerName: "ليان", problem: "المكيّف لا يبرّد ويصدر صوتاً", category: "تكييف وتبريد", area: "وادي الجوز", distanceKm: 1.4, fairPrice: "140–190 ₪", urgency: "اليوم", createdAt: "منذ 12 دقيقة", latitude: 31.7938, longitude: 35.2361, description: "المكيّف يعمل لكن الهواء غير بارد ويوجد صوت اهتزاز واضح من الوحدة الداخلية.", state: "viewed" },
  { id: "sheikh_jarrah_electric", customerName: "مريم", problem: "القاطع الرئيسي يفصل باستمرار", category: "كهرباء", area: "الشيخ جراح", distanceKm: 2.1, fairPrice: "160–220 ₪", urgency: "عاجل", createdAt: "منذ 20 دقيقة", latitude: 31.7888, longitude: 35.2298, description: "القاطع الرئيسي يفصل كلما تم تشغيل سخان المياه، ونحتاج فحصاً آمناً للتوصيلات.", state: "new" },
  { id: "silwan_carpentry", customerName: "خليل", problem: "باب خزانة المطبخ مكسور", category: "نجارة", area: "سلوان", distanceKm: 2.8, fairPrice: "90–130 ₪", urgency: "عادي", createdAt: "منذ 35 دقيقة", latitude: 31.7708, longitude: 35.2351, description: "مفصلة باب خزانة المطبخ انفصلت من الخشب والباب أصبح مائلاً.", state: "offered" }
] as const;

export const technicianConversations = [
  { id: "chat-ahmad", customerName: "أحمد", requestId: "old_city_plumbing_leak", problem: "تسريب سيفون تحت المجلى", lastMessage: "تمام، بانتظار العرض داخل التطبيق.", time: "10:18 ص", unread: 2 },
  { id: "chat-layan", customerName: "ليان", requestId: "wadi_joz_ac", problem: "المكيّف لا يبرّد", lastMessage: "هل القطع مشمولة في السعر؟", time: "أمس", unread: 0 },
  { id: "chat-mariam", customerName: "مريم", requestId: "sheikh_jarrah_electric", problem: "القاطع الرئيسي يفصل", lastMessage: "التواصل والدفع سيكونان عبر عَمِّرها.", time: "الثلاثاء", unread: 0 }
] as const;

export const technicianJobs = [
  { id: "demo-job-offer-tariq-plumbing", requestId: "old_city_plumbing_leak", customerName: "أحمد", problem: "تسريب سيفون تحت المجلى", status: "on_the_way" as const, statusLabel: "في الطريق", date: "اليوم • 10:14 ص", price: 120, area: "البلدة القديمة" },
  { id: "job-completed-heater", requestId: "heater-repair", customerName: "سليم", problem: "صيانة سخان مياه", status: "completed" as const, statusLabel: "مكتمل", date: "أمس • 4:30 م", price: 180, area: "بيت حنينا" },
  { id: "job-completed-pump", requestId: "pump-repair", customerName: "رنا", problem: "إصلاح مضخة مياه", status: "completed" as const, statusLabel: "مكتمل", date: "14 أيلول • 1:20 م", price: 240, area: "الطور" }
] as const;

export function getTechnicianRequest(id: string) {
  return technicianRequests.find((request) => request.id === id);
}
