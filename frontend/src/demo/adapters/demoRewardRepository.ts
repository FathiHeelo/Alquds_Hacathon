import type { RewardRepository } from "../../domain/contracts/rewardRepository";
import type { Reward, RewardAccount } from "../../domain/models/reward";
const rewards: Reward[] = [
  { id: "reward-electric", partner: "مؤسسة القدس للإنارة والكهرباء", title: "خصم 10% على كافة القواطع", description: "واد الجوز • قسيمة شريك محلي معتمد", pointsCost: 200 },
  { id: "reward-plumbing", partner: "مركز الأقصى للأدوات الصحية", title: "قسيمة بقيمة 25 شيكل", description: "شعفاط • صالحة على الأدوات الصحية", pointsCost: 300 },
  { id: "reward-stone", partner: "حجر ومواد بناء بيت المقدس", title: "خصم 10% على مواد البناء", description: "العيزرية / الطور • متجر معتمد", pointsCost: 400 }
];
const initialAccount: RewardAccount = { balance: 850, history: [{ id: "earned-1", label: "تقييم صيانة السباكة بالبلدة القديمة", points: 50 }] };
let account: RewardAccount = { ...initialAccount, history: [...initialAccount.history] };
export class DemoRewardRepository implements RewardRepository { async getAccount() { return { ...account, history: [...account.history] }; } async getRewards() { return rewards; } async redeem(id: string) { const reward = rewards.find((item) => item.id === id); if (!reward || account.balance < reward.pointsCost) throw new Error("INSUFFICIENT_POINTS"); account = { balance: account.balance - reward.pointsCost, history: [{ id: `redeem-${id}`, label: `استبدال ${reward.title}`, points: -reward.pointsCost }, ...account.history] }; return this.getAccount(); } }
export const rewardRepository = new DemoRewardRepository();
export function resetDemoRewards() { account = { ...initialAccount, history: [...initialAccount.history] }; }
