import { rewardPoints } from "../../config/business";
import { Collections, col } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { withId } from "../../shared/firestore.helpers";
import type { JobDoc } from "../jobs/jobs.repository";
import { awardPoints } from "../rewards/rewards.service";
import { technicianRepository } from "../technicians/technicians.repository";

export interface ReviewInput {
  overall: number;
  quality: number;
  speed: number;
  commitment: number;
  communication: number;
  comment?: string;
}

const jobs = () => col(Collections.jobs);
const reviews = () => col(Collections.reviews);

export const reviewService = {
  /** Customer reviews their own completed job, once. Updates the rating aggregate and awards points. */
  async submit(jobId: string, customerId: string, input: ReviewInput) {
    const jobSnap = await jobs().doc(jobId).get();
    if (!jobSnap.exists) throw new AppError(ErrorCode.JobNotFound, "Job not found", 404);
    const job = jobSnap.data() as JobDoc;
    if (job.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your job", 403);
    if (job.status !== "completed") throw new AppError(ErrorCode.ReviewNotEligible, "Only completed jobs can be reviewed", 409);

    const doc = { ...input, jobId, customerId, technicianId: job.technicianId, createdAt: new Date() };
    try {
      // `create()` on a doc id = jobId enforces "one review per job" atomically, no transaction needed.
      await reviews().doc(jobId).create(doc);
    } catch {
      throw new AppError(ErrorCode.Conflict, "You already reviewed this job", 409);
    }

    await technicianRepository.onReview(job.technicianId, input);
    await awardPoints(customerId, rewardPoints.customerRatedJob, "job_rated", jobId);
    return { id: jobId, ...doc };
  },

  async getForJob(jobId: string, user: { id: string; role: string }) {
    const jobSnap = await jobs().doc(jobId).get();
    if (!jobSnap.exists) throw new AppError(ErrorCode.JobNotFound, "Job not found", 404);
    const job = jobSnap.data() as JobDoc;
    if (user.role !== "admin" && job.customerId !== user.id && job.technicianId !== user.id) {
      throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this job", 403);
    }
    const snap = await reviews().doc(jobId).get();
    return snap.exists ? withId(snap) : null;
  }
};
