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

export const technicianService = {
  async get(userId: string) {
    const profile = await technicianRepository.findProfile(userId);
    if (!profile) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    return withReputation(profile);
  },
  async update(
    userId: string,
    input: { specialty?: string; yearsExperience?: number; serviceAreas?: string[]; availability?: "available" | "busy" | "offline"; bio?: string }
  ) {
    await this.get(userId);
    await technicianRepository.updateProfile(userId, input);
    return this.get(userId);
  },
  async list(filter: { specialty?: string; area?: string }) {
    const profiles = await technicianRepository.list({
      isVerified: true,
      ...(filter.specialty ? { specialty: filter.specialty } : {})
    });
    const filtered = filter.area
      ? profiles.filter((p) => Array.isArray(p.serviceAreas) && (p.serviceAreas as string[]).includes(filter.area!))
      : profiles;
    return Promise.all(filtered.map(withReputation));
  },
  reviews: (userId: string) => technicianRepository.reviews(userId)
};
