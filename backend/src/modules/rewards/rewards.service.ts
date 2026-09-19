import { randomBytes } from "node:crypto";

import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import type { Db } from "../../shared/db";
import { NotificationType, notify } from "../notifications/notifications.service";
import { rewardRepository } from "./rewards.repository";

/** Idempotent earn: one award per (user, reason, ref). Safe to call inside a transaction. */
export const awardPoints = async (userId: string, points: number, reason: string, refId: string, db: Db = prisma) => {
  if (await rewardRepository.findEarn(userId, reason, refId, db)) return null;
  const tx = await rewardRepository.createTx({ userId, type: "earn", points, reason, refId }, db);
  await notify(userId, NotificationType.Reward, `You earned ${points} points`, undefined, { points, reason }, db);
  return tx;
};

export const rewardService = {
  balance: (userId: string) => rewardRepository.balance(userId),
  transactions: (userId: string) => rewardRepository.transactions(userId),
  redemptions: (userId: string) => rewardRepository.redemptions(userId),
  partnerRewards: () => rewardRepository.activeRewards(),

  /** Balance check and ledger write happen under a user row lock, so points can never go negative. */
  async redeem(userId: string, rewardId: string) {
    const reward = await rewardRepository.findReward(rewardId);
    if (!reward || !reward.active) throw new AppError(ErrorCode.NotFound, "Reward not available", 404);

    return prisma.$transaction(async (tx) => {
      await rewardRepository.lockUser(userId, tx);
      const { balance } = await rewardRepository.balance(userId, tx);
      if (balance < reward.pointsCost) {
        throw new AppError(ErrorCode.InsufficientPoints, `Need ${reward.pointsCost} points, you have ${balance}`, 409);
      }
      const redemption = await rewardRepository.createRedemption(
        { userId, rewardId, points: reward.pointsCost, code: `AMR-${randomBytes(4).toString("hex").toUpperCase()}` },
        tx
      );
      await rewardRepository.createTx({ userId, type: "redeem", points: reward.pointsCost, reason: "redemption", refId: redemption.id }, tx);
      return { redemption, balance: balance - reward.pointsCost };
    });
  }
};
