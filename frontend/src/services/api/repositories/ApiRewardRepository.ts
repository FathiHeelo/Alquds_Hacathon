import type { RewardRepository } from "../../../domain/contracts/rewardRepository";
import type { RewardAccount } from "../../../domain/models/reward";
import { apiClient } from "../apiClient";
type Transaction = { id: string; type: "earn" | "redeem"; points: number; reason: string };
type PartnerReward = { id: string; title: string; description?: string | null; benefit?: string | null; pointsCost: number; partner: { name: string } };
export class ApiRewardRepository implements RewardRepository {
  async getAccount(): Promise<RewardAccount> { const [balance, history] = await Promise.all([apiClient.request<{ balance: number }>("/rewards/balance", undefined, "customer"), apiClient.request<Transaction[]>("/rewards/transactions", undefined, "customer")]); return { balance: balance.balance, history: history.map((item) => ({ id: item.id, labelKey: item.type === "earn" ? "rewards.historyEarned" : "rewards.historyRedeemed", points: item.type === "earn" ? item.points : -item.points })) }; }
  async getRewards() { return (await apiClient.request<PartnerReward[]>("/rewards/partners", undefined, "customer")).map((item) => ({ id: item.id, partnerKey: item.partner.name, titleKey: item.title, descriptionKey: item.description ?? item.title, categoryKey: "rewards.categories.tools", benefitKey: item.benefit ?? item.title, pointsCost: item.pointsCost })); }
  async redeem(id: string) { await apiClient.request("/rewards/redeem", { method: "POST", body: JSON.stringify({ partnerRewardId: id }) }, "customer"); return this.getAccount(); }
}
