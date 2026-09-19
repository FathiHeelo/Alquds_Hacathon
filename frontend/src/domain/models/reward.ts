export interface Reward { id: string; partnerKey: string; titleKey: string; descriptionKey: string; categoryKey: string; benefitKey: string; pointsCost: number; }
export interface RewardAccount { balance: number; history: { id: string; labelKey: string; points: number }[]; }
