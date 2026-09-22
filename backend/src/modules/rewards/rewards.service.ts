import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { NotificationType, notify } from "../notifications/notifications.service";
import { rewardRepository } from "./rewards.repository";
import { userRepository, withBalance } from "../users/users.repository";

/** Idempotent earn: one award per (user, reason, ref). Safe to call any time after the triggering write. */
export const awardPoints = async (userId: string, points: number, reason: string, refId: string) => {
  const awarded = await rewardRepository.awardIfNew(userId, points, reason, refId);
  if (awarded) await notify(userId, NotificationType.Reward, `حصلت على ${points} نقطة`, "تمت إضافة النقاط إلى رصيد مكافآت عَمِّرها.", { points, reason });
  return awarded;
};

export const rewardService = {
  async balance(userId: string) {
    const user = await userRepository.findById(userId);
    const { pointsEarned, pointsRedeemed, pointsBalance } = withBalance(user ?? { pointsEarned: 0, pointsRedeemed: 0 });
    return { earned: pointsEarned, redeemed: pointsRedeemed, balance: pointsBalance };
  },
  transactions: (userId: string) => rewardRepository.transactions(userId),
  redemptions: (userId: string) => rewardRepository.redemptions(userId),
  partnerRewards: () => rewardRepository.activeRewards(),

  async redeem(userId: string, rewardId: string) {
    const reward = await rewardRepository.findReward(rewardId);
    if (!reward || !reward.active) throw new AppError(ErrorCode.NotFound, "Reward not available", 404);

    const result = await rewardRepository.redeem(userId, reward);
    if (!result.ok) throw new AppError(ErrorCode.InsufficientPoints, `Need ${reward.pointsCost} points, you have ${result.balance}`, 409);
    return { redemption: result.redemption, balance: result.balance };
  }
};
