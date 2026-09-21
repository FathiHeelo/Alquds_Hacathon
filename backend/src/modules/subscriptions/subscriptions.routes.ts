import { Router } from "express";

import { guard } from "../../middleware/auth";
import { subscriptionService } from "./subscriptions.service";

export const subscriptionsRouter = Router();
subscriptionsRouter.use(guard("technician"));

subscriptionsRouter.get("/me", async (request, response) => {
  response.json(await subscriptionService.getEntitlement(request.auth!.id));
});

/** Gate used before exposing the AI Offer Assistant: 200 for Pro, 403 PRO_REQUIRED otherwise. */
subscriptionsRouter.get("/capabilities/offer-assistant", async (request, response) => {
  await subscriptionService.assertOfferAssistantAccess(request.auth!.id);
  response.json({ allowed: true });
});
