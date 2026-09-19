import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { offersRouter } from "../offers/offers.routes";
import { repairRequestService, type RequestInput } from "./repairRequest.service";

export const repairRequestsRouter = Router();
export const categoriesRouter = Router();

const mediaSchema = z.object({ url: z.string().url().max(2000), type: z.enum(["image", "video", "audio"]).default("image") });

const createSchema = z.object({
  categoryId: z.string().min(1),
  description: z.string().trim().min(5).max(2000),
  locationSummary: z.string().trim().max(255).optional(),
  area: z.string().trim().max(60).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  preferredTime: z.coerce.date().optional(),
  aiSummary: z.record(z.string(), z.unknown()).optional(),
  media: z.array(mediaSchema).max(10).optional()
});
const updateSchema = createSchema.partial();

categoriesRouter.get("/", guard(), async (_request, response) => {
  response.json(await repairRequestService.categories());
});

repairRequestsRouter.post("/", guard("customer"), validate("body", createSchema), async (request, response) => {
  response.status(201).json(await repairRequestService.create(request.auth!.id, validated<RequestInput>(request, "body")));
});

repairRequestsRouter.get("/", guard("customer"), async (request, response) => {
  response.json(await repairRequestService.listMine(request.auth!.id));
});

repairRequestsRouter.get("/feed", guard("technician"), async (request, response) => {
  response.json(await repairRequestService.feed(request.auth!.id));
});

repairRequestsRouter.get("/:id", guard(), async (request, response) => {
  response.json(await repairRequestService.getForUser(String(request.params.id), request.auth!));
});

repairRequestsRouter.patch("/:id", guard("customer"), validate("body", updateSchema), async (request, response) => {
  response.json(await repairRequestService.update(String(request.params.id), request.auth!.id, validated<Partial<RequestInput>>(request, "body")));
});

repairRequestsRouter.post("/:id/cancel", guard("customer"), async (request, response) => {
  response.json(await repairRequestService.cancel(String(request.params.id), request.auth!.id));
});

// /repair-requests/:id/offers (create + list)
repairRequestsRouter.use("/:id/offers", offersRouter);
