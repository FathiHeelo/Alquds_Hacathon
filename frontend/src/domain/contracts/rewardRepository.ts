import type { Reward, RewardAccount } from "../models/reward";
export interface RewardRepository { getAccount(): Promise<RewardAccount>; getRewards(): Promise<readonly Reward[]>; redeem(id: string): Promise<RewardAccount>; }
