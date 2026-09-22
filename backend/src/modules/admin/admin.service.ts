import { Collections, col, globalStatsRef } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { notify } from "../notifications/notifications.service";
import { technicianRepository } from "../technicians/technicians.repository";
import { userRepository } from "../users/users.repository";
import { tsMillis, withId } from "../../shared/firestore.helpers";

export interface RiskInput {
  userId?: string;
  requestId?: string;
  level: "low" | "medium" | "high";
  score?: number;
  source?: string;
  flags?: { code: string; note?: string }[];
}

type CaseStatus = "open" | "reviewed" | "dismissed";
type AdminActionType = "review" | "warn" | "suspend" | "freeze" | "unfreeze";

const reports = () => col(Collections.reports);
const risks = () => col(Collections.riskAssessments);
const adminActions = () => col(Collections.adminActions);
const users = () => col(Collections.users);
const subscriptions = () => col(Collections.subscriptions);
const jobs = () => col(Collections.jobs);

export const adminService = {
  // ── Technician verification ──
  verificationQueue: (status: "pending" | "approved" | "rejected") => technicianRepository.verificationQueue(status),

  async decideVerification(adminId: string, technicianId: string, decision: "approve" | "reject", note?: string) {
    if (!(await technicianRepository.findProfile(technicianId))) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    const approved = decision === "approve";
    await technicianRepository.updateProfile(technicianId, { verificationStatus: approved ? "approved" : "rejected", isVerified: approved });
    await adminActions().add({ adminId, targetUserId: technicianId, action: "review", note: `verification ${decision}${note ? `: ${note}` : ""}`, createdAt: new Date() });
    return technicianRepository.findProfile(technicianId);
  },

  // ── Safety reports ──
  async reports(status?: CaseStatus) {
    const snap = status ? await reports().where("status", "==", status).get() : await reports().get();
    return snap.docs.map(withId).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt)).slice(0, 100);
  },

  async setReportStatus(id: string, status: CaseStatus) {
    const ref = reports().doc(id);
    if (!(await ref.get()).exists) throw new AppError(ErrorCode.NotFound, "Report not found", 404);
    await ref.update({ status, updatedAt: new Date() });
    return { id, ...(await ref.get()).data() };
  },

  // ── Risk assessments (persisted Jabr outputs or manual/demo entries; never auto-actioned) ──
  async createRisk({ flags = [], ...data }: RiskInput) {
    const ref = risks().doc();
    const doc = { ...data, source: data.source ?? "manual", status: "open" as const, flags, createdAt: new Date() };
    await ref.set(doc);
    return { id: ref.id, ...doc };
  },

  async risks(status?: CaseStatus) {
    const snap = status ? await risks().where("status", "==", status).get() : await risks().get();
    return snap.docs.map(withId).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt)).slice(0, 100);
  },

  async reviewRisk(adminId: string, id: string, status: "reviewed" | "dismissed", note?: string) {
    const ref = risks().doc(id);
    if (!(await ref.get()).exists) throw new AppError(ErrorCode.NotFound, "Risk assessment not found", 404);
    await ref.update({ status, reviewedBy: adminId, reviewedAt: new Date(), reviewNote: note ?? null });
    const snap = await ref.get();
    return withId(snap);
  },

  // ── Explicit human actions on accounts ──
  async actOnUser(adminId: string, userId: string, action: AdminActionType, note?: string) {
    const snap = await users().doc(userId).get();
    if (!snap.exists) throw new AppError(ErrorCode.NotFound, "User not found", 404);
    const user = snap.data() as { role: string };
    if (user.role === "admin") throw new AppError(ErrorCode.PermissionDenied, "Cannot act on admin accounts", 403);

    const status = action === "suspend" ? "suspended" : action === "freeze" ? "frozen" : action === "unfreeze" ? "active" : undefined;
    if (status) await userRepository.setStatus(userId, status);
    await adminActions().add({ adminId, targetUserId: userId, action, note: note ?? null, createdAt: new Date() });
    if (action === "warn") await notify(userId, "admin_warning", "Warning from AMMERHA", note);

    const updated = await users().doc(userId).get();
    const data = updated.data() as { name: string; role: string; status: string };
    return { id: userId, name: data.name, role: data.role, status: data.status };
  },

  // ── Summary ──
  async summary() {
    // Single-field filters + in-memory reduction throughout, so this never needs a manual composite index.
    const [users_, technicians, proSubsSnap, openReportsCount, riskDocs, completedJobsCount, stats] = await Promise.all([
      userRepository.count(),
      technicianRepository.count(),
      subscriptions().where("plan", "==", "pro").get(),
      reports().where("status", "==", "open").count().get(),
      risks().where("status", "==", "open").get(),
      jobs().where("status", "==", "completed").count().get(),
      globalStatsRef().get()
    ]);

    const now = new Date();
    const proSubscribers = proSubsSnap.docs.filter((d) => {
      const s = d.data() as { status: string; activeUntil?: FirebaseFirestore.Timestamp | Date | null };
      const until = s.activeUntil instanceof Date ? s.activeUntil : s.activeUntil?.toDate();
      return s.status === "active" && (!until || until > now);
    }).length;
    const openRisks = riskDocs.docs.map((d) => d.data() as { level: string });
    const statsData = stats.data() as { completedJobsCount?: number; grossTotal?: number; platformFeeTotal?: number } | undefined;

    return {
      users: users_,
      technicians,
      proSubscribers,
      completedJobs: completedJobsCount.data().count,
      commissions: {
        jobs: statsData?.completedJobsCount ?? 0,
        gross: statsData?.grossTotal ?? 0,
        platformFees: statsData?.platformFeeTotal ?? 0
      },
      openReports: openReportsCount.data().count,
      openRiskFlags: openRisks.length,
      highRiskOpen: openRisks.filter((r) => r.level === "high").length
    };
  }
};
