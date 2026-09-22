import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { round1 } from "../../shared/firestore.helpers";
import { technicianRepository, type TechnicianProfileDoc } from "./technicians.repository";

/** Profile + reputation, computed from the atomic sum/count counters (no scatter-gather over reviews). */
const withReputation = (profile: TechnicianProfileDoc & { userId: string }) => ({
  ...profile,
  reputation: {
    ratingAvg: round1(profile.ratingSum, profile.ratingCount),
    ratingCount: profile.ratingCount,
    completedJobs: profile.completedJobsCount,
    breakdown: {
      quality: round1(profile.qualitySum, profile.ratingCount),
      speed: round1(profile.speedSum, profile.ratingCount),
      commitment: round1(profile.commitmentSum, profile.ratingCount),
      communication: round1(profile.communicationSum, profile.ratingCount)
    }
  }
});

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
    if (!(await technicianRepository.findProfile(userId))) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);
    await technicianRepository.updateProfile(userId, input);
    return this.get(userId);
  },
  async list(filter: { specialty?: string; area?: string }) {
    const profiles = await technicianRepository.list();
    const filtered = profiles.filter(
      (p) => (!filter.specialty || p.specialty === filter.specialty) && (!filter.area || p.serviceAreas.includes(filter.area))
    );
    return filtered.map(withReputation);
  },
  reviews: (userId: string) => technicianRepository.reviews(userId)
};
