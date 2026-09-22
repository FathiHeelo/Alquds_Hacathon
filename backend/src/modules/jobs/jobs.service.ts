import { rewardPoints } from "../../config/business";
import { FieldValue, globalStatsRef } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import type { JobStatus, UserRole } from "../../shared/status";
import { NotificationType, notify } from "../notifications/notifications.service";
import { repairRequestRepository } from "../repair-requests/repairRequest.repository";
import { awardPoints } from "../rewards/rewards.service";
import { technicianRepository } from "../technicians/technicians.repository";
import { computeFinancials } from "./jobs.finance";
import { jobRepository, type JobDoc } from "./jobs.repository";

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
    if (user.role === "technician") return jobRepository.listForUser("technicianId", user.id);
    if (user.role === "customer") return jobRepository.listForUser("customerId", user.id);
    return []; // Admin summary/reporting reads jobs via admin.service, not this per-user listing.
  },

  async get(id: string, user: { id: string; role: UserRole }) {
    const job = await jobRepository.findById(id);
    if (!job) throw notFound();
    assertParticipant(job, user);
    return job;
  },

  async changeStatus(id: string, user: { id: string; role: UserRole }, input: StatusInput) {
    const ref = jobRepository.ref(id);
    const snap = await ref.get();
    if (!snap.exists) throw notFound();
    const job = snap.data() as JobDoc;
    assertParticipant(job, user);

    // Technician drives progress; the customer may only cancel before work starts.
    const customerCancel = user.role === "customer" && input.status === "cancelled" && ["accepted", "scheduled"].includes(job.status);
    if (user.role !== "technician" && !customerCancel) {
      throw new AppError(ErrorCode.PermissionDenied, "Only the technician can change this job status", 403);
    }
    if (!jobTransitions[job.status].includes(input.status)) {
      throw new AppError(ErrorCode.InvalidJobTransition, `Cannot move job from ${job.status} to ${input.status}`, 409);
    }

    const financial = input.status === "completed" ? computeFinancials(input.laborAmount ?? job.offer.price, input.partsAmount ?? 0) : undefined;
    const patch: Partial<JobDoc> = {
      status: input.status,
      ...(input.status === "scheduled" && input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
      ...(input.status === "in_progress" ? { startedAt: new Date() } : {}),
      ...(input.status === "completed" ? { completedAt: new Date(), financial } : {})
    };

    // The CAS transition is the only step that races with anything else; everything after it is a
    // one-time side effect only the (guaranteed unique) winner performs.
    if (!(await jobRepository.transition(id, job.status, patch))) {
      throw new AppError(ErrorCode.InvalidJobTransition, "Job status changed concurrently, retry", 409);
    }

    const payload = { jobId: id, requestId: job.requestId };
    if (input.status === "on_the_way") await notify(job.customerId, NotificationType.OnTheWay, "Technician is on the way", undefined, payload);
    if (input.status === "in_progress") await notify(job.customerId, NotificationType.Started, "Work has started", undefined, payload);

    if (input.status === "cancelled") {
      await repairRequestRepository.transitionStatus(job.requestId, ["accepted"], "cancelled");
      const other = user.id === job.customerId ? job.technicianId : job.customerId;
      await notify(other, NotificationType.JobCancelled, "Job was cancelled", undefined, payload);
    }

    if (input.status === "completed" && financial) {
      await repairRequestRepository.transitionStatus(job.requestId, ["accepted"], "completed");
      await technicianRepository.onCompletedJob(job.technicianId, financial);
      await globalStatsRef().set(
        { completedJobsCount: FieldValue.increment(1), grossTotal: FieldValue.increment(financial.subtotal), platformFeeTotal: FieldValue.increment(financial.platformFee) },
        { merge: true }
      );
      await notify(job.customerId, NotificationType.Completed, "Job completed", undefined, payload);
      await notify(job.customerId, NotificationType.RatingRequest, "How was the service? Rate your technician", undefined, payload);
      await awardPoints(job.technicianId, rewardPoints.technicianCompletedJob, "job_completed", id);
    }

    return this.get(id, user);
  }
};
