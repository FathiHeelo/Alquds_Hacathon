import { Collections, col } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import type { TechnicianProfileDoc } from "../technicians/technicians.repository";

export const reportService = {
  /** Safety/abuse case raised by a user; reviewed by an admin. */
  async create(reporterId: string, input: { targetUserId?: string; jobId?: string; reason: string; details?: string }) {
    const ref = col(Collections.reports).doc();
    const doc = { reporterId, ...input, status: "open", createdAt: new Date(), updatedAt: new Date() };
    await ref.set(doc);
    return { id: ref.id, ...doc };
  },

  /** Technician earnings, read straight off the atomic counters maintained at job-completion time. */
  async technicianEarnings(technicianId: string) {
    const snap = await col(Collections.technicianProfiles).doc(technicianId).get();
    if (!snap.exists) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    const p = snap.data() as TechnicianProfileDoc;
    return {
      completedJobs: p.completedJobsCount,
      gross: p.earningsGross,
      labor: p.earningsLabor,
      parts: p.earningsParts,
      platformFees: p.earningsPlatformFee,
      netEarnings: p.earningsNet
    };
  }
};
