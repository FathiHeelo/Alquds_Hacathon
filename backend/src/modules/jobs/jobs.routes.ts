import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { chatRouter } from "../chat/chat.routes";
import { reviewsRouter } from "../reviews/reviews.routes";
import { jobService, type StatusInput } from "./jobs.service";

export const jobsRouter = Router();

const statusSchema = z.object({
  status: z.enum(["scheduled", "on_the_way", "in_progress", "completed", "cancelled"]),
  scheduledAt: z.coerce.date().optional(),
  laborAmount: z.number().min(0).max(100000).optional(),
  partsAmount: z.number().min(0).max(100000).optional()
});

jobsRouter.get("/", guard("customer", "technician", "admin"), async (request, response) => {
  response.json(await jobService.listMine(request.auth!));
});

jobsRouter.get("/:id", guard(), async (request, response) => {
  response.json(await jobService.get(String(request.params.id), request.auth!));
});

jobsRouter.post("/:id/status", guard("customer", "technician"), validate("body", statusSchema), async (request, response) => {
  response.json(await jobService.changeStatus(String(request.params.id), request.auth!, validated<StatusInput>(request, "body")));
});

// /jobs/:id/conversation, /jobs/:id/review
jobsRouter.use("/:id/conversation", chatRouter);
jobsRouter.use("/:id/review", reviewsRouter);
