import type { Review } from "../models/review";
export interface ReviewRepository { getForJob(jobId: string): Promise<Review | undefined>; submit(review: Omit<Review, "id">): Promise<Review>; }
