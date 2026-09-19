import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

export const rewardRepository = {
  findEarn: (userId: string, reason: string, refId: string, db: Db = prisma) =>
    db.rewardTransaction.findFirst({ where: { userId, reason, refId } }),
  createTx: (data: Prisma.RewardTransactionUncheckedCreateInput, db: Db = prisma) => db.rewardTransaction.create({ data }),
  /** Ledger balance = sum(earn) - sum(redeem). */
  async balance(userId: string, db: Db = prisma) {
    const groups = await db.rewardTransaction.groupBy({ by: ["type"], where: { userId }, _sum: { points: true } });
    const sum = (type: string) => groups.find((g) => g.type === type)?._sum.points ?? 0;
    return { earned: sum("earn"), redeemed: sum("redeem"), balance: sum("earn") - sum("redeem") };
  },
  transactions: (userId: string) => prisma.rewardTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
  activeRewards: () => prisma.partnerReward.findMany({ where: { active: true }, include: { partner: true }, orderBy: { pointsCost: "asc" } }),
  findReward: (id: string, db: Db = prisma) => db.partnerReward.findUnique({ where: { id }, include: { partner: true } }),
  createRedemption: (data: Prisma.RedemptionUncheckedCreateInput, db: Db = prisma) => db.redemption.create({ data }),
  redemptions: (userId: string) =>
    prisma.redemption.findMany({ where: { userId }, include: { reward: { include: { partner: true } } }, orderBy: { createdAt: "desc" } }),
  /** Row lock on the user so concurrent redemptions serialize (inside a transaction). */
  lockUser: (userId: string, db: Prisma.TransactionClient) => db.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`
};
