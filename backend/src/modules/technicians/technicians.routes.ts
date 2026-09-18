import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { technicianService } from "./technicians.service";

export const techniciansRouter = Router();

const updateSchema = z.object({
  specialty: z.string().trim().min(1).max(50).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  serviceAreas: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  availability: z.enum(["available", "busy", "offline"]).optional(),
  bio: z.string().trim().max(1000).optional()
});
const listQuery = z.object({ specialty: z.string().optional(), area: z.string().optional() });

techniciansRouter.get("/", guard(), validate("query", listQuery), async (request, response) => {
  response.json(await technicianService.list(validated(request, "query")));
});

techniciansRouter.get("/me", guard("technician"), async (request, response) => {
  response.json(await technicianService.get(request.auth!.id));
});

techniciansRouter.patch("/me", guard("technician"), validate("body", updateSchema), async (request, response) => {
  response.json(await technicianService.update(request.auth!.id, validated(request, "body")));
});

techniciansRouter.get("/:id", guard(), async (request, response) => {
  response.json(await technicianService.get(String(request.params.id)));
});

techniciansRouter.get("/:id/reviews", guard(), async (request, response) => {
  response.json(await technicianService.reviews(String(request.params.id)));
});
