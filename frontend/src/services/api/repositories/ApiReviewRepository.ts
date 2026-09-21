import type { ReviewRepository } from "../../../domain/contracts/reviewRepository";
import type { Review } from "../../../domain/models/review";
import { apiClient } from "../apiClient";
export class ApiReviewRepository implements ReviewRepository { async getForJob(jobId: string) { const result = await apiClient.request<Review | null>(`/jobs/${jobId}/review`, undefined, "customer"); return result ?? undefined; } async getForTechnician(technicianId: string) { return apiClient.request<Review[]>(`/technicians/${technicianId}/reviews`, undefined, "customer"); } async submit(review: Omit<Review, "id">) { const { jobId, technicianId: _technicianId, ...body } = review; return apiClient.request<Review>(`/jobs/${jobId}/review`, { method: "POST", body: JSON.stringify(body) }, "customer"); } }
