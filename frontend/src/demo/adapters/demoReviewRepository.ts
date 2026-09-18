import type { ReviewRepository } from "../../domain/contracts/reviewRepository";
import type { Review } from "../../domain/models/review";
const reviews = new Map<string, Review>();
export class DemoReviewRepository implements ReviewRepository { async getForJob(jobId: string) { return reviews.get(jobId); } async getForTechnician(technicianId: string) { return [...reputationReviews, ...reviews.values()].filter((review) => review.technicianId === technicianId); } async submit(review: Omit<Review, "id">) { const existing = reviews.get(review.jobId); if (existing) return existing; const value = { ...review, id: `review-${review.jobId}` }; reviews.set(review.jobId, value); return value; } }
const reputationReviews: Review[] = [{ id: "reputation-tariq-1", jobId: "demo-reputation-job", technicianId: "tech-tariq-maqdisi", overall: 5, quality: 5, speed: 5, commitment: 5, communication: 5, comment: "وصل في الموعد وأصلح التسريب بسرعة." }];
export const reviewRepository = new DemoReviewRepository();
export function resetDemoReviews() { reviews.clear(); }
