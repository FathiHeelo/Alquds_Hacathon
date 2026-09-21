import { prisma } from "../../database/prisma";
import { num } from "../../shared/money";

export const reportService = {
  /** Safety/abuse case raised by a user; reviewed by an admin. */
  create: (reporterId: string, input: { targetUserId?: string; jobId?: string; reason: string; details?: string }) =>
    prisma.report.create({ data: { reporterId, ...input } }),

  /** Technician earnings aggregate from persisted job financial summaries. */
  async technicianEarnings(technicianId: string) {
    const agg = await prisma.jobFinancial.aggregate({
      where: { job: { technicianId } },
      _sum: { subtotal: true, platformFee: true, technicianEarning: true, labor: true, parts: true },
      _count: true
    });
    return {
      completedJobs: agg._count,
      gross: num(agg._sum.subtotal ?? 0),
      labor: num(agg._sum.labor ?? 0),
      parts: num(agg._sum.parts ?? 0),
      platformFees: num(agg._sum.platformFee ?? 0),
      netEarnings: num(agg._sum.technicianEarning ?? 0)
    };
  }
};
