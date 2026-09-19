import type { Review } from "../models/review";
export interface ReviewRepository { getForJob(jobId: string): Promise<Review | undefined>; getForTechnician(technicianId: string): Promise<readonly Review[]>; submit(review: Omit<Review, "id">): Promise<Review>; }
