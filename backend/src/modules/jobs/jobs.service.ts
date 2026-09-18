import type { JobStatus, UserRole } from "@prisma/client";

import { rewardPoints } from "../../config/business";
import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { num } from "../../shared/money";
import { NotificationType, notify } from "../notifications/notifications.service";
import { repairRequestRepository } from "../repair-requests/repairRequest.repository";
import { awardPoints } from "../rewards/rewards.service";
import { computeFinancials } from "./jobs.finance";
import { jobRepository } from "./jobs.repository";

/** Allowed job status transitions (enforced here, never in controllers). */
export const jobTransitions: Record<JobStatus, JobStatus[]> = {
  accepted: ["scheduled", "on_the_way", "cancelled"],
  scheduled: ["on_the_way", "cancelled"],
  on_the_way: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};

const notFound = () => new AppError(ErrorCode.JobNotFound, "Job not found", 404);

type Job = NonNullable<Awaited<ReturnType<typeof jobRepository.findById>>>;

/** Mobile-ready shape: Decimals become numbers. */
const present = (job: Job) => ({
  ...job,
  offer: { ...job.offer, price: num(job.offer.price) },
  financial: job.financial && {
    ...job.financial,
    labor: num(job.financial.labor),
    parts: num(job.financial.parts),
    subtotal: num(job.financial.subtotal),
    commissionRate: Number(job.financial.commissionRate),
    platformFee: num(job.financial.platformFee),
    total: num(job.financial.total),
    technicianEarning: num(job.financial.technicianEarning)
  }
});

const assertParticipant = (job: { customerId: string; technicianId: string }, user: { id: string; role: UserRole }) => {
  if (user.role !== "admin" && job.customerId !== user.id && job.technicianId !== user.id) {
    throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this job", 403);
  }
};

export interface StatusInput {
  status: JobStatus;
  scheduledAt?: Date;
  /** Only used when completing: overrides the default (accepted offer price, no parts). */
  laborAmount?: number;
  partsAmount?: number;
}

export const jobService = {
  async listMine(user: { id: string; role: UserRole }) {
    const where = user.role === "technician" ? { technicianId: user.id } : user.role === "customer" ? { customerId: user.id } : {};
    return (await jobRepository.listForUser(where)).map(present);
  },

  async get(id: string, user: { id: string; role: UserRole }) {
    const job = await jobRepository.findById(id);
    if (!job) throw notFound();
    assertParticipant(job, user);
    return present(job);
  },

  async changeStatus(id: string, user: { id: string; role: UserRole }, input: StatusInput) {
    const job = await jobRepository.findById(id);
    if (!job) throw notFound();
    assertParticipant(job, user);

    // Technician drives progress; the customer may only cancel before work starts.
    const customerCancel = user.role === "customer" && input.status === "cancelled" && ["accepted", "scheduled"].includes(job.status);
    if (user.role !== "technician" && !customerCancel) {
      throw new AppError(ErrorCode.PermissionDenied, "Only the technician can change this job status", 403);
    }
    if (!jobTransitions[job.status].includes(input.status)) {
      throw new AppError(ErrorCode.InvalidJobTransition, `Cannot move job from ${job.status} to ${input.status}`, 409);
    }

    await prisma.$transaction(async (tx) => {
      const patch = {
        status: input.status,
        ...(input.status === "scheduled" && input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
        ...(input.status === "in_progress" ? { startedAt: new Date() } : {}),
        ...(input.status === "completed" ? { completedAt: new Date() } : {})
      };
      if (!(await jobRepository.transition(id, job.status, patch, tx))) {
        throw new AppError(ErrorCode.InvalidJobTransition, "Job status changed concurrently, retry", 409);
      }

      const payload = { jobId: id, requestId: job.requestId };
      if (input.status === "on_the_way") await notify(job.customerId, NotificationType.OnTheWay, "Technician is on the way", undefined, payload, tx);
      if (input.status === "in_progress") await notify(job.customerId, NotificationType.Started, "Work has started", undefined, payload, tx);

      if (input.status === "cancelled") {
        await repairRequestRepository.transitionStatus(job.requestId, ["accepted"], "cancelled", tx);
        const other = user.id === job.customerId ? job.technicianId : job.customerId;
        await notify(other, NotificationType.JobCancelled, "Job was cancelled", undefined, payload, tx);
      }

      if (input.status === "completed") {
        await repairRequestRepository.transitionStatus(job.requestId, ["accepted"], "completed", tx);
        const labor = input.laborAmount ?? Number(job.offer.price);
        await jobRepository.createFinancial({ jobId: id, ...computeFinancials(labor, input.partsAmount ?? 0) }, tx);
        await notify(job.customerId, NotificationType.Completed, "Job completed", undefined, payload, tx);
        await notify(job.customerId, NotificationType.RatingRequest, "How was the service? Rate your technician", undefined, payload, tx);
        await awardPoints(job.technicianId, rewardPoints.technicianCompletedJob, "job_completed", id, tx);
      }
    });

    return this.get(id, user);
  }
};
