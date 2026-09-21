import type { TechnicianProfile } from "@prisma/client";

import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { technicianRepository } from "./technicians.repository";

const round1 = (value: number | null) => (value === null ? 0 : Math.round(value * 10) / 10);

/** Profile + reputation aggregates derived from real jobs/reviews. */
const withReputation = async <T extends TechnicianProfile>(profile: T) => {
  const [completedJobs, agg] = await Promise.all([
    technicianRepository.completedJobs(profile.userId),
    technicianRepository.reviewAggregate(profile.userId)
  ]);
  return {
    ...profile,
    reputation: {
      ratingAvg: round1(agg._avg.overall),
      ratingCount: agg._count,
      completedJobs,
      breakdown: {
        quality: round1(agg._avg.quality),
        speed: round1(agg._avg.speed),
        commitment: round1(agg._avg.commitment),
        communication: round1(agg._avg.communication)
      }
    }
  };
};

const withBulkReputation = async <T extends TechnicianProfile>(profiles: T[]) => {
  if (!profiles.length) return [];
  const ids = profiles.map(({ userId }) => userId);
  const [jobs, reviews] = await Promise.all([
    technicianRepository.completedJobsFor(ids),
    technicianRepository.reviewAggregatesFor(ids)
  ]);
  const completedByTechnician = new Map(jobs.map((row) => [row.technicianId, row._count._all]));
  const reviewsByTechnician = new Map(reviews.map((row) => [row.technicianId, row]));
  return profiles.map((profile) => {
    const agg = reviewsByTechnician.get(profile.userId);
    return {
      ...profile,
      reputation: {
        ratingAvg: round1(agg?._avg.overall ?? null),
        ratingCount: agg?._count._all ?? 0,
        completedJobs: completedByTechnician.get(profile.userId) ?? 0,
        breakdown: {
          quality: round1(agg?._avg.quality ?? null),
          speed: round1(agg?._avg.speed ?? null),
          commitment: round1(agg?._avg.commitment ?? null),
          communication: round1(agg?._avg.communication ?? null)
        }
      }
    };
  });
};

export const technicianService = {
  async get(userId: string) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    return withReputation(profile);
  },
  async update(
    userId: string,
    input: { specialty?: string; yearsExperience?: number; serviceAreas?: string[]; availability?: "available" | "busy" | "offline"; bio?: string; lat?: number; lng?: number; acceptsUrgentRequests?: boolean }
  ) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    return withReputation(await technicianRepository.updateProfile(userId, input));
  },
  async list(filter: { specialty?: string; area?: string }) {
    const profiles = await technicianRepository.list({
      isVerified: true,
      ...(filter.specialty ? { specialty: filter.specialty } : {})
    });
    const filtered = filter.area
      ? profiles.filter((p) => Array.isArray(p.serviceAreas) && (p.serviceAreas as string[]).includes(filter.area!))
      : profiles;
    return withBulkReputation(filtered);
  },
  reviews: (userId: string) => technicianRepository.reviews(userId)
};
