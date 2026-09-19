import type { RewardRepository } from "../../domain/contracts/rewardRepository";
import type { Reward, RewardAccount } from "../../domain/models/reward";
const rewards: Reward[] = [
  { id: "reward-electric", partnerKey: "rewards.catalog.electric.partner", titleKey: "rewards.catalog.electric.title", descriptionKey: "rewards.catalog.electric.description", categoryKey: "rewards.categories.electric", benefitKey: "rewards.catalog.electric.benefit", pointsCost: 200 },
  { id: "reward-plumbing", partnerKey: "rewards.catalog.plumbing.partner", titleKey: "rewards.catalog.plumbing.title", descriptionKey: "rewards.catalog.plumbing.description", categoryKey: "rewards.categories.plumbing", benefitKey: "rewards.catalog.plumbing.benefit", pointsCost: 300 },
  { id: "reward-stone", partnerKey: "rewards.catalog.stone.partner", titleKey: "rewards.catalog.stone.title", descriptionKey: "rewards.catalog.stone.description", categoryKey: "rewards.categories.building", benefitKey: "rewards.catalog.stone.benefit", pointsCost: 400 },
  { id: "reward-tools", partnerKey: "rewards.catalog.tools.partner", titleKey: "rewards.catalog.tools.title", descriptionKey: "rewards.catalog.tools.description", categoryKey: "rewards.categories.tools", benefitKey: "rewards.catalog.tools.benefit", pointsCost: 1200 }
];
const initialAccount: RewardAccount = { balance: 850, history: [{ id: "earned-1", labelKey: "rewards.historyEarned", points: 50 }] };
let account: RewardAccount = { ...initialAccount, history: [...initialAccount.history] };
export class DemoRewardRepository implements RewardRepository { async getAccount() { return { ...account, history: [...account.history] }; } async getRewards() { return rewards; } async redeem(id: string) { const reward = rewards.find((item) => item.id === id); if (!reward || account.balance < reward.pointsCost) throw new Error("INSUFFICIENT_POINTS"); account = { balance: account.balance - reward.pointsCost, history: [{ id: `redeem-${id}`, labelKey: "rewards.historyRedeemed", points: -reward.pointsCost }, ...account.history] }; return this.getAccount(); } }
export const rewardRepository = new DemoRewardRepository();
export function resetDemoRewards() { account = { ...initialAccount, history: [...initialAccount.history] }; }
