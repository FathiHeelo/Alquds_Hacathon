import { Prisma } from "@prisma/client";

import { rewardPoints } from "../../config/business";
import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { awardPoints } from "../rewards/rewards.service";

export interface ReviewInput {
  overall: number;
  quality: number;
  speed: number;
  commitment: number;
  communication: number;
  comment?: string;
}

export const reviewService = {
  /** Customer reviews their own completed job, once. Updates the rating aggregate and awards points. */
  async submit(jobId: string, customerId: string, input: ReviewInput) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new AppError(ErrorCode.JobNotFound, "Job not found", 404);
    if (job.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your job", 403);
    if (job.status !== "completed") throw new AppError(ErrorCode.ReviewNotEligible, "Only completed jobs can be reviewed", 409);

    try {
      return await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({ data: { ...input, jobId, customerId, technicianId: job.technicianId } });
        const agg = await tx.review.aggregate({ where: { technicianId: job.technicianId }, _avg: { overall: true }, _count: true });
        await tx.technicianProfile.update({
          where: { userId: job.technicianId },
          data: { ratingAvg: Math.round((agg._avg.overall ?? 0) * 10) / 10, ratingCount: agg._count }
        });
        await awardPoints(customerId, rewardPoints.customerRatedJob, "job_rated", jobId, tx);
        return review;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(ErrorCode.Conflict, "You already reviewed this job", 409);
      }
      throw error;
    }
  },

  async getForJob(jobId: string, user: { id: string; role: string }) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { review: true } });
    if (!job) throw new AppError(ErrorCode.JobNotFound, "Job not found", 404);
    if (user.role !== "admin" && job.customerId !== user.id && job.technicianId !== user.id) {
      throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this job", 403);
    }
    return job.review;
  }
};
