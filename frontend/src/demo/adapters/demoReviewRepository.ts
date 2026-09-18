import type { ReviewRepository } from "../../domain/contracts/reviewRepository";
import type { Review } from "../../domain/models/review";
const reviews = new Map<string, Review>();
export class DemoReviewRepository implements ReviewRepository { async getForJob(jobId: string) { return reviews.get(jobId); } async submit(review: Omit<Review, "id">) { const existing = reviews.get(review.jobId); if (existing) return existing; const value = { ...review, id: `review-${review.jobId}` }; reviews.set(review.jobId, value); return value; } }
export const reviewRepository = new DemoReviewRepository();
export function resetDemoReviews() { reviews.clear(); }
