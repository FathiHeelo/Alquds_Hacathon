import type {
  TechnicianCandidate,
  TechnicianMatch,
  TechnicianRankingInput,
} from "../../contracts/matching.types";

const MATCHING_WEIGHTS = {
  specialty: 30,
  distance: 20,
  rating: 20,
  availability: 15,
  reliability: 15,
} as const;

const MAX_DISTANCE_KM = 50;
const MAX_RELIABLE_JOBS = 100;

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function specialtyScore(
  candidate: TechnicianCandidate,
  category: TechnicianRankingInput["category"],
): number {
  const normalizedCategory = normalizeCategory(category);

  if (candidate.categoryIds?.includes(category)) {
    return 100;
  }

  if (candidate.specialty) {
    const specialty = candidate.specialty.toLowerCase();

    if (
      specialty.includes(normalizedCategory) ||
      (normalizedCategory === "appliances" &&
        (specialty.includes("appliance") ||
          specialty.includes("washing machine"))) ||
      (normalizedCategory === "ac" &&
        (specialty.includes("air conditioner") ||
          specialty.includes("air conditioning")))
    ) {
      return 100;
    }

    return 50;
  }

  // Older frontend data may not contain specialty information.
  // Use a neutral value instead of assuming a mismatch.
  return 50;
}

function distanceScore(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return 0;
  }

  if (distanceKm >= MAX_DISTANCE_KM) {
    return 0;
  }

  return Math.round(
    ((MAX_DISTANCE_KM - distanceKm) / MAX_DISTANCE_KM) * 100,
  );
}

function ratingScore(rating: number): number {
  if (!Number.isFinite(rating) || rating < 0) {
    return 0;
  }

  return Math.round(Math.min(rating, 5) * 20);
}

function availabilityScore(
  candidate: TechnicianCandidate,
): number {
  if (candidate.isAvailable === undefined) {
    return 50;
  }

  return candidate.isAvailable ? 100 : 0;
}

function reliabilityScore(completedJobs: number): number {
  if (!Number.isFinite(completedJobs) || completedJobs < 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((completedJobs / MAX_RELIABLE_JOBS) * 100),
  );
}

function buildReasons(
  candidate: TechnicianCandidate,
  scores: {
    specialty: number;
    distance: number;
    rating: number;
    availability: number;
    reliability: number;
  },
): string[] {
  const reasons: string[] = [];

  if (scores.specialty >= 100) {
    reasons.push("specialty_match");
  }

  if (scores.distance >= 80) {
    reasons.push("nearby");
  } else if (scores.distance >= 50) {
    reasons.push("reasonable_distance");
  }

  if (scores.rating >= 90) {
    reasons.push("high_rating");
  } else if (scores.rating >= 70) {
    reasons.push("good_rating");
  }

  if (candidate.isAvailable === true) {
    reasons.push("available");
  } else if (candidate.isAvailable === false) {
    reasons.push("unavailable");
  }

  if (scores.reliability >= 80) {
    reasons.push("strong_job_history");
  } else if (scores.reliability >= 50) {
    reasons.push("established_job_history");
  }

  return reasons;
}

function calculateMatch(
  candidate: TechnicianCandidate,
  category: TechnicianRankingInput["category"],
): TechnicianMatch {
  const scores = {
    specialty: specialtyScore(candidate, category),
    distance: distanceScore(candidate.distanceKm),
    rating: ratingScore(candidate.rating),
    availability: availabilityScore(candidate),
    reliability: reliabilityScore(candidate.completedJobs),
  };

  const score = Math.round(
    (scores.specialty * MATCHING_WEIGHTS.specialty) / 100 +
      (scores.distance * MATCHING_WEIGHTS.distance) / 100 +
      (scores.rating * MATCHING_WEIGHTS.rating) / 100 +
      (scores.availability * MATCHING_WEIGHTS.availability) / 100 +
      (scores.reliability * MATCHING_WEIGHTS.reliability) / 100,
  );

  return {
    technicianId: candidate.id,
    score: Math.max(0, Math.min(100, score)),
    reasons: buildReasons(candidate, scores),
    scoreBreakdown: {
      specialty:
        Math.round(
          (scores.specialty * MATCHING_WEIGHTS.specialty) / 100,
        ),
      distance:
        Math.round(
          (scores.distance * MATCHING_WEIGHTS.distance) / 100,
        ),
      rating:
        Math.round(
          (scores.rating * MATCHING_WEIGHTS.rating) / 100,
        ),
      availability:
        Math.round(
          (scores.availability * MATCHING_WEIGHTS.availability) / 100,
        ),
      reliability:
        Math.round(
          (scores.reliability * MATCHING_WEIGHTS.reliability) / 100,
        ),
    },
  };
}

export function rankTechnicians(
  input: TechnicianRankingInput,
): TechnicianMatch[] {
  return input.candidates
    .map((candidate) => calculateMatch(candidate, input.category))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (a.technicianId !== b.technicianId) {
        return a.technicianId.localeCompare(b.technicianId);
      }

      return 0;
    });
}