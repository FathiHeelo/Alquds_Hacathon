import { apiClient } from "./apiClient";
export interface ProEntitlement { plan: "free" | "pro"; status: string; isPro: boolean; capabilities: { offerAssistant: boolean }; }
export const subscriptionApi = { getMine: () => apiClient.request<ProEntitlement>("/subscriptions/me", undefined, "technician"), canUseOfferAssistant: async () => { await apiClient.request("/subscriptions/capabilities/offer-assistant", undefined, "technician"); return true; } };
