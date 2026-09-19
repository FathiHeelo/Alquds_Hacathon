export type CustomerRequestState = "on_the_way" | "scheduled" | "completed" | "cancelled";

export interface CustomerRequestItem {
  id: string;
  jobId: string;
  offerId: string;
  technicianId: string;
  title: string;
  category: string;
  orderNumber: string;
  state: CustomerRequestState;
  statusLabel: string;
  statusDetail: string;
  date: string;
  location: string;
  price: number;
}

export const customerRequests: readonly CustomerRequestItem[] = [
  {
    id: "old_city_plumbing_leak",
    jobId: "demo-job-offer-tariq-plumbing",
    offerId: "offer-tariq-plumbing",
    technicianId: "tech-tariq-maqdisi",
    title: "تسريب سيفون تحت المجلى",
    category: "سباكة",
    orderNumber: "#JM-7821",
    state: "on_the_way",
    statusLabel: "الفني في الطريق",
    statusDetail: "الوصول خلال 5–7 دقائق",
    date: "اليوم • 10:14 ص",
    location: "عقبة الخالدية، البلدة القديمة",
    price: 120
  },
  {
    id: "home_ac_service",
    jobId: "demo-job-ac-samer",
    offerId: "offer-samer-ac",
    technicianId: "tech-samer-halawani",
    title: "تنظيف وصيانة المكيّف",
    category: "تكييف وتبريد",
    orderNumber: "#JM-7794",
    state: "scheduled",
    statusLabel: "موعد محجوز",
    statusDetail: "غداً بين 9:00 و10:00 صباحاً",
    date: "أمس • 6:20 م",
    location: "وادي الجوز، القدس",
    price: 160
  },
  {
    id: "sheikh_jarrah_electrical",
    jobId: "demo-job-electrical-mahmoud",
    offerId: "offer-mahmoud-electrical",
    technicianId: "tech-mahmoud-khatib",
    title: "إصلاح قاطع الكهرباء الرئيسي",
    category: "كهرباء",
    orderNumber: "#JM-7658",
    state: "completed",
    statusLabel: "مكتمل",
    statusDetail: "تم التنفيذ والتقييم بنجاح",
    date: "12 أيلول • 4:35 م",
    location: "الشيخ جراح، القدس",
    price: 180
  },
  {
    id: "silwan_carpentry_cancelled",
    jobId: "demo-job-carpentry-yousef",
    offerId: "offer-yousef-carpentry",
    technicianId: "tech-yousef-najjar",
    title: "إصلاح باب خزانة المطبخ",
    category: "نجارة",
    orderNumber: "#JM-7512",
    state: "cancelled",
    statusLabel: "ملغي",
    statusDetail: "أُلغي قبل قبول أي عرض",
    date: "4 أيلول • 1:10 م",
    location: "سلوان، القدس",
    price: 0
  }
] as const;

export function getCustomerRequest(id: string) {
  return customerRequests.find((request) => request.id === id);
}

export function mapDomainRequestToCustomerItem(request: import("../../domain/models/repairRequest").RepairRequest): CustomerRequestItem {
  const names: Record<string, string> = { electrical: "كهرباء", plumbing: "سباكة", ac: "تكييف وتبريد", appliances: "أجهزة منزلية", carpentry: "نجارة", electronics: "إلكترونيات", general: "صيانة عامة" };
  return { id: request.id, jobId: "", offerId: "", technicianId: "", title: request.description, category: names[request.category] ?? request.category, orderNumber: `#${request.id.slice(-6).toUpperCase()}`, state: "scheduled", statusLabel: "بانتظار عروض الفنيين", statusDetail: "سنبلغك عند وصول عرض", date: new Date(request.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }), location: request.location.label, price: 0 };
}
