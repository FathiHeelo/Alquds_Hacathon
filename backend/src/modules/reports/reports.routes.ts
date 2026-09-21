import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { reportService } from "./reports.service";

export const reportsRouter = Router();

const createSchema = z.object({
  targetUserId: z.string().optional(),
  jobId: z.string().optional(),
  reason: z.string().trim().min(3).max(200),
  details: z.string().trim().max(2000).optional()
});

reportsRouter.post("/", guard("customer", "technician"), validate("body", createSchema), async (request, response) => {
  response.status(201).json(await reportService.create(request.auth!.id, validated<z.infer<typeof createSchema>>(request, "body")));
});

reportsRouter.get("/earnings/me", guard("technician"), async (request, response) => {
  response.json(await reportService.technicianEarnings(request.auth!.id));
});
