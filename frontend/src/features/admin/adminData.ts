export type AdminCaseKind = "risk" | "verification" | "report";
import { appConfig } from "../../app/config/appConfig";

export interface AdminCase {
  id: string;
  kind: AdminCaseKind;
  title: string;
  subject: string;
  area: string;
  time: string;
  description: string;
  severity: "critical" | "warning" | "normal";
  evidence: readonly string[];
}

export const adminCases: readonly AdminCase[] = [
  { id: "risk-off-platform", kind: "risk", title: "محاولة دفع خارج المنصة", subject: "الفني: س. ح.", area: "البلدة القديمة", time: "منذ 12 دقيقة", description: "تم رصد رسالة تطلب اتصالاً ودفعاً نقدياً خارج عَمِّرها للحصول على سعر أقل.", severity: "critical", evidence: ["الرسالة المرصودة: رن علي كاش بطلع أرخص", "محاولتان لمشاركة رقم هاتف", "الطلب ما زال مفتوحاً"] },
  { id: "risk-cancellations", kind: "risk", title: "معدل إلغاء مرتفع بعد الوصول", subject: "الفني: م. ع.", area: "شعفاط", time: "اليوم", description: "3 طلبات أُلغيت بعد وصول الفني في المنطقة نفسها، مع احتمال اتفاق خارجي.", severity: "warning", evidence: ["3 إلغاءات خلال 7 أيام", "الإلغاء بعد تأكيد الوصول", "قيم الطلبات: 110–260 ₪"] },
  { id: "verify-saeed", kind: "verification", title: "سعيد كمال", subject: "فني تكييف وتبريد", area: "الشيخ جراح", time: "منذ ساعة", description: "طلب توثيق جديد لهوية مقدسية وشهادة مهنية.", severity: "normal", evidence: ["هوية مقدسية سارية", "إثبات سكن بالشيخ جراح", "شهادة معهد قلنديا"] },
  { id: "verify-rana", kind: "verification", title: "رنا الحسيني", subject: "فنية كهرباء منزلية", area: "بيت حنينا", time: "أمس", description: "تحديث شهادة مزاولة المهنة وإضافة تخصص جديد.", severity: "normal", evidence: ["الهوية موثقة سابقاً", "شهادة كهرباء منزلية", "سجل 38 عملاً مكتملًا"] },
  { id: "report-delay", kind: "report", title: "بلاغ تأخر عن الموعد", subject: "العميل: ل. ن. / الفني: ط. م.", area: "وادي الجوز", time: "منذ 35 دقيقة", description: "الفني تأخر 45 دقيقة عن الموعد ولم يحدّث حالة الوصول.", severity: "warning", evidence: ["الموعد: 3:00 م", "آخر موقع مسجل: على بعد 1.2 كم", "لا توجد إساءة في المحادثة"] },
  { id: "report-description", kind: "report", title: "وصف طلب غير دقيق", subject: "الطلب #AM-2418", area: "الطور", time: "أمس", description: "الفني أفاد أن المشكلة الفعلية تختلف عن الصور والوصف المرسل.", severity: "normal", evidence: ["صورتان مرفقتان", "تشخيص AI بثقة 62%", "لم يبدأ العمل بعد"] }
] as const;

export const auditEntries = [
  { action: "اعتماد هوية فني", actor: "المشرف نور", target: "سعيد كمال", time: "اليوم • 10:32 ص", color: "#047857" },
  { action: "بدء تدقيق مخاطر", actor: "النظام الذكي", target: "الحساب م. ع.", time: "اليوم • 9:48 ص", color: "#D97706" },
  { action: "توجيه إنذار خصوصية", actor: "المشرف سامر", target: "الحساب س. ح.", time: "أمس • 6:14 م", color: "#BE123C" },
  { action: "إغلاق بلاغ عميل", actor: "فريق السلامة", target: "البلاغ AM-2387", time: "أمس • 2:05 م", color: "#1D4ED8" }
] as const;

let apiCases: readonly AdminCase[] = [];
export function cacheAdminCases(items: readonly AdminCase[], kind?: AdminCaseKind) {
  apiCases = kind ? [...apiCases.filter((item) => item.kind !== kind), ...items] : [...apiCases.filter((existing) => !items.some((item) => item.id === existing.id)), ...items];
}
export function getAdminCase(id: string) { return apiCases.find((item) => item.id === id) ?? (appConfig.demoMode ? adminCases.find((item) => item.id === id) : undefined); }
