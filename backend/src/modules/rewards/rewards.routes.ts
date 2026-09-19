import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { rewardService } from "./rewards.service";

export const rewardsRouter = Router();
rewardsRouter.use(guard("customer", "technician"));

const redeemSchema = z.object({ partnerRewardId: z.string().min(1) });

rewardsRouter.get("/balance", async (request, response) => {
  response.json(await rewardService.balance(request.auth!.id));
});

rewardsRouter.get("/transactions", async (request, response) => {
  response.json(await rewardService.transactions(request.auth!.id));
});

rewardsRouter.get("/partners", async (_request, response) => {
  response.json(await rewardService.partnerRewards());
});

rewardsRouter.get("/redemptions", async (request, response) => {
  response.json(await rewardService.redemptions(request.auth!.id));
});

rewardsRouter.post("/redeem", validate("body", redeemSchema), async (request, response) => {
  const { partnerRewardId } = validated<z.infer<typeof redeemSchema>>(request, "body");
  response.status(201).json(await rewardService.redeem(request.auth!.id, partnerRewardId));
});
