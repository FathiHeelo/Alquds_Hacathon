import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { reviewService, type ReviewInput } from "./reviews.service";

/** Nested under /jobs/:id/review */
export const reviewsRouter = Router({ mergeParams: true });

const score = z.number().int().min(1).max(5);
const reviewSchema = z.object({
  overall: score,
  quality: score,
  speed: score,
  commitment: score,
  communication: score,
  comment: z.string().trim().max(1000).optional()
});

reviewsRouter.post("/", guard("customer"), validate("body", reviewSchema), async (request, response) => {
  response.status(201).json(await reviewService.submit(String(request.params.id), request.auth!.id, validated<ReviewInput>(request, "body")));
});

reviewsRouter.get("/", guard(), async (request, response) => {
  response.json(await reviewService.getForJob(String(request.params.id), request.auth!));
});
