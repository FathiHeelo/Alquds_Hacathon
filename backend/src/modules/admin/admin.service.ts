import type { AdminActionType, CaseStatus, RiskLevel } from "@prisma/client";

import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { num } from "../../shared/money";
import { notify } from "../notifications/notifications.service";

export interface RiskInput {
  userId?: string;
  requestId?: string;
  level: RiskLevel;
  score?: number;
  source?: string;
  flags?: { code: string; note?: string }[];
}

export const adminService = {
  // ── Technician verification ──
  verificationQueue: (status: "pending" | "approved" | "rejected") =>
    prisma.technicianProfile.findMany({
      where: { verificationStatus: status },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "asc" }
    }),

  async decideVerification(adminId: string, technicianId: string, decision: "approve" | "reject", note?: string) {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId: technicianId } });
    if (!profile) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    const approved = decision === "approve";
    const updated = await prisma.technicianProfile.update({
      where: { userId: technicianId },
      data: { verificationStatus: approved ? "approved" : "rejected", isVerified: approved }
    });
    await prisma.adminAction.create({ data: { adminId, targetUserId: technicianId, action: "review", note: `verification ${decision}${note ? `: ${note}` : ""}` } });
    return updated;
  },

  // ── Safety reports ──
  reports: (status?: CaseStatus) => prisma.report.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 100 }),

  async setReportStatus(id: string, status: CaseStatus) {
    const found = await prisma.report.findUnique({ where: { id } });
    if (!found) throw new AppError(ErrorCode.NotFound, "Report not found", 404);
    return prisma.report.update({ where: { id }, data: { status } });
  },

  // ── Risk assessments (persisted Jabr outputs or manual/demo entries; never auto-actioned) ──
  createRisk: ({ flags = [], ...data }: RiskInput) =>
    prisma.riskAssessment.create({ data: { ...data, source: data.source ?? "manual", flags: { create: flags } }, include: { flags: true } }),

  risks: (status?: CaseStatus) =>
    prisma.riskAssessment.findMany({ where: status ? { status } : {}, include: { flags: true }, orderBy: { createdAt: "desc" }, take: 100 }),

  async reviewRisk(adminId: string, id: string, status: "reviewed" | "dismissed", note?: string) {
    const found = await prisma.riskAssessment.findUnique({ where: { id } });
    if (!found) throw new AppError(ErrorCode.NotFound, "Risk assessment not found", 404);
    return prisma.riskAssessment.update({
      where: { id },
      data: { status, reviewedBy: adminId, reviewedAt: new Date(), reviewNote: note },
      include: { flags: true }
    });
  },

  // ── Explicit human actions on accounts ──
  async actOnUser(adminId: string, userId: string, action: AdminActionType, note?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(ErrorCode.NotFound, "User not found", 404);
    if (user.role === "admin") throw new AppError(ErrorCode.PermissionDenied, "Cannot act on admin accounts", 403);

    const status = action === "suspend" ? "suspended" : action === "freeze" ? "frozen" : action === "unfreeze" ? "active" : undefined;
    await prisma.$transaction(async (tx) => {
      if (status) await tx.user.update({ where: { id: userId }, data: { status } });
      await tx.adminAction.create({ data: { adminId, targetUserId: userId, action, note } });
      if (action === "warn") await notify(userId, "admin_warning", "Warning from AMMERHA", note, undefined, tx);
    });
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true, status: true } });
  },

  // ── Summary ──
  async summary() {
    const [users, technicians, proSubscribers, openReports, openRisks, highRisks, fin, jobs] = await Promise.all([
      prisma.user.count(),
      prisma.technicianProfile.count(),
      prisma.subscription.count({ where: { plan: "pro", status: "active", OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }] } }),
      prisma.report.count({ where: { status: "open" } }),
      prisma.riskAssessment.count({ where: { status: "open" } }),
      prisma.riskAssessment.count({ where: { status: "open", level: "high" } }),
      prisma.jobFinancial.aggregate({ _sum: { subtotal: true, platformFee: true }, _count: true }),
      prisma.job.count({ where: { status: "completed" } })
    ]);
    return {
      users,
      technicians,
      proSubscribers,
      completedJobs: jobs,
      commissions: { jobs: fin._count, gross: num(fin._sum.subtotal ?? 0), platformFees: num(fin._sum.platformFee ?? 0) },
      openReports,
      openRiskFlags: openRisks,
      highRiskOpen: highRisks
    };
  }
};
