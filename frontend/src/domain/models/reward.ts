export interface Reward { id: string; partner: string; title: string; description: string; pointsCost: number; }
export interface RewardAccount { balance: number; history: { id: string; label: string; points: number }[]; }
