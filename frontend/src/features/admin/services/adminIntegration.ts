import { appConfig } from "../../../app/config/appConfig";
import { adminApi } from "../../../services/api/adminApi";
import { adminCases, cacheAdminCases, type AdminCase, type AdminCaseKind } from "../adminData";

type QueueKind = "verification" | "reports" | "risk";
const displayKind = (kind: QueueKind): AdminCaseKind => kind === "reports" ? "report" : kind;
const text = (value: unknown, fallback: string) => typeof value === "string" && value ? value : fallback;
const date = (value: unknown) => typeof value === "string" ? new Date(value).toLocaleString() : "الآن";

function mapVerification(value: Record<string, unknown>): AdminCase { const user = (value.user ?? {}) as Record<string, unknown>; return { id: text(value.userId, "unknown"), kind: "verification", title: text(user.name, "فني جديد"), subject: text(value.specialty, "فني صيانة"), area: Array.isArray(value.serviceAreas) ? value.serviceAreas.join("، ") : "القدس", time: date(value.createdAt), description: "طلب توثيق هوية وشهادات مهنية بانتظار قرار المشرف.", severity: "normal", evidence: [text(user.email, "بريد مسجل"), text(user.phone, "هاتف مسجل")] }; }
function mapReport(value: Record<string, unknown>): AdminCase { return { id: text(value.id, "unknown"), kind: "report", title: text(value.reason, "بلاغ سلامة"), subject: text(value.reporterId, "مستخدم عَمِّرها"), area: "القدس", time: date(value.createdAt), description: text(value.details, "بلاغ بحاجة إلى مراجعة بشرية."), severity: "warning", evidence: [text(value.reason, "بلاغ مسجل في النظام")] }; }
function mapRisk(value: Record<string, unknown>): AdminCase { const level = text(value.level, "medium"); const flags = Array.isArray(value.flags) ? value.flags as Record<string, unknown>[] : []; return { id: text(value.id, "unknown"), kind: "risk", title: "حالة مخاطر بحاجة إلى مراجعة", subject: text(value.userId, "حساب غير محدد"), area: "القدس", time: date(value.createdAt), description: `المصدر: ${text(value.source, "manual")} • الدرجة: ${String(value.score ?? "-")}`, severity: level === "high" ? "critical" : level === "medium" ? "warning" : "normal", evidence: flags.length ? flags.map((flag) => text(flag.code, "risk_flag")) : ["تقييم مخاطر محفوظ"] }; }

export async function loadAdminCases(kind: QueueKind): Promise<readonly AdminCase[]> {
  const fallback = adminCases.filter((item) => item.kind === displayKind(kind));
  if (appConfig.demoMode) return fallback;
  try { const raw = kind === "verification" ? await adminApi.verificationQueue() : kind === "reports" ? await adminApi.reports() : await adminApi.risks(); const mapped = (raw as Record<string, unknown>[]).map(kind === "verification" ? mapVerification : kind === "reports" ? mapReport : mapRisk); cacheAdminCases(mapped); return mapped; } catch { return fallback; }
}

export async function applyAdminDecision(kind: QueueKind, id: string, positive: boolean) {
  if (appConfig.demoMode) return;
  if (kind === "verification") await adminApi.decideVerification(id, positive ? "approve" : "reject", positive ? undefined : "Documents require completion");
  else if (kind === "reports") await adminApi.setReportStatus(id, positive ? "reviewed" : "open");
  else await adminApi.reviewRisk(id, positive ? "reviewed" : "dismissed");
}
