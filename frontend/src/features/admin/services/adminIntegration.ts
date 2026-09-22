import { appConfig } from "../../../app/config/appConfig";
import { AppError } from "../../../shared/errors/AppError";
import { adminApi } from "../../../services/api/adminApi";
import { adminCases, cacheAdminCases, type AdminCase, type AdminCaseKind } from "../adminData";

type QueueKind = "verification" | "reports" | "risk";
const displayKind = (kind: QueueKind): AdminCaseKind => kind === "reports" ? "report" : kind;
const text = (value: unknown, fallback: string) => typeof value === "string" && value ? value : fallback;
const date = (value: unknown) => typeof value === "string" ? new Date(value).toLocaleString() : "الآن";
const people: Record<string, { name: string; area: string }> = {
  "demo-customer": { name: "أحمد المقدسي", area: "البلدة القديمة" },
  "demo-technician": { name: "طارق المقدسي", area: "الشيخ جراح" },
  "demo-technician-2": { name: "رنا الحسيني", area: "بيت حنينا" },
  "tech-user-04": { name: "يوسف الدجاني", area: "بيت حنينا" },
  "tech-user-05": { name: "خالد سليم", area: "بيت صفافا" },
  "tech-user-06": { name: "عمر حجازي", area: "باب الساهرة" },
  "customer-01": { name: "ليان ناصر", area: "سلوان" },
  "customer-02": { name: "محمد حمدان", area: "وادي الجوز" }
};
const person = (value: unknown) => people[text(value, "")] ?? { name: "مستخدم عَمِّرها", area: "القدس" };
const riskTitle = (flags: Record<string, unknown>[]) => flags.length ? text(flags[0]?.code, "تنبيه مخاطر").replaceAll("_", " ") : "حالة مخاطر بحاجة إلى مراجعة";

function mapVerification(value: Record<string, unknown>): AdminCase { const user = (value.user ?? {}) as Record<string, unknown>; return { id: text(value.userId, "unknown"), kind: "verification", title: text(user.name, "فني جديد"), subject: text(value.specialty, "فني صيانة"), area: Array.isArray(value.serviceAreas) ? value.serviceAreas.join("، ") : "غير محدد", time: date(value.createdAt), description: "طلب توثيق هوية وشهادات مهنية بانتظار قرار المشرف.", severity: "normal", evidence: [text(user.email, "بريد مسجل"), text(user.phone, "هاتف مسجل")] }; }
function mapReport(value: Record<string, unknown>): AdminCase { const reporter = person(value.reporterId); const target = person(value.targetUserId); return { id: text(value.id, "unknown"), kind: "report", title: text(value.reason, "بلاغ سلامة"), subject: `المرسل: ${reporter.name} • الطرف الآخر: ${target.name}`, area: reporter.area, time: date(value.createdAt), description: text(value.details, "بلاغ بحاجة إلى مراجعة بشرية داخل المنصة."), severity: "warning", evidence: [text(value.reason, "بلاغ مسجل في النظام"), "المحادثة والطلب محفوظان للمراجعة"] }; }
function mapRisk(value: Record<string, unknown>): AdminCase { const level = text(value.level, "medium"); const flags = Array.isArray(value.flags) ? value.flags as Record<string, unknown>[] : []; const owner = person(value.userId); return { id: text(value.id, "unknown"), kind: "risk", title: riskTitle(flags), subject: `الحساب: ${owner.name}`, area: owner.area, time: date(value.createdAt), description: `رصد ${text(value.source, "نظام عَمِّرها")} الحالة بدرجة ${String(value.score ?? "-")} وتحتاج قرار المشرف.`, severity: level === "high" ? "critical" : level === "medium" ? "warning" : "normal", evidence: flags.length ? flags.map((flag) => text(flag.note, text(flag.code, "تنبيه مخاطر"))) : ["تقييم مخاطر محفوظ"] }; }

export async function loadAdminCases(kind: QueueKind): Promise<readonly AdminCase[]> {
  const fallback = adminCases.filter((item) => item.kind === displayKind(kind));
  if (appConfig.demoMode) { cacheAdminCases(fallback, displayKind(kind)); return fallback; }
  try { const raw = kind === "verification" ? await adminApi.verificationQueue() : kind === "reports" ? await adminApi.reports() : await adminApi.risks(); const mapped = (raw as Record<string, unknown>[]).map(kind === "verification" ? mapVerification : kind === "reports" ? mapReport : mapRisk); cacheAdminCases(mapped, displayKind(kind)); return mapped; } catch (error) {
    if (!appConfig.apiFallbackToDemo || !(error instanceof AppError) || !["NETWORK_ERROR", "NETWORK_TIMEOUT"].includes(error.code)) throw error;
    if (__DEV__) console.warn("[AMMERHA] API unavailable — using demo fallback");
    cacheAdminCases(fallback, displayKind(kind));
    return fallback;
  }
}

export async function applyAdminDecision(kind: QueueKind, id: string, positive: boolean) {
  if (appConfig.demoMode) return;
  if (kind === "verification") await adminApi.decideVerification(id, positive ? "approve" : "reject", positive ? undefined : "Documents require completion");
  else if (kind === "reports") await adminApi.setReportStatus(id, positive ? "reviewed" : "open");
  else await adminApi.reviewRisk(id, positive ? "reviewed" : "dismissed");
}
