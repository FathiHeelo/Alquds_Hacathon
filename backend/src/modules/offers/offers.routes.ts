import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { offerService, type OfferInput } from "./offers.service";

const createSchema = z.object({
  price: z.number().positive().max(100000),
  message: z.string().trim().max(1000).optional(),
  etaMinutes: z.number().int().positive().max(60 * 24 * 14).optional()
});

/** Nested under /repair-requests/:id/offers */
export const offersRouter = Router({ mergeParams: true });

offersRouter.post("/", guard("technician"), validate("body", createSchema), async (request, response) => {
  response.status(201).json(await offerService.create(String(request.params.id), request.auth!.id, validated<OfferInput>(request, "body")));
});

offersRouter.get("/", guard("customer"), async (request, response) => {
  response.json(await offerService.listForRequest(String(request.params.id), request.auth!.id));
});

/** Mounted at /offers */
export const offersTopRouter = Router();

offersTopRouter.get("/mine", guard("technician"), async (request, response) => {
  response.json(await offerService.listMine(request.auth!.id));
});

offersTopRouter.post("/:id/accept", guard("customer"), async (request, response) => {
  response.status(201).json(await offerService.accept(String(request.params.id), request.auth!.id));
});

offersTopRouter.post("/:id/withdraw", guard("technician"), async (request, response) => {
  response.json(await offerService.withdraw(String(request.params.id), request.auth!.id));
});
