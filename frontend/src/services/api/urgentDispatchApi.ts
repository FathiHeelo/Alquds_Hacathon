import { apiClient } from "./apiClient";

export interface UrgentDispatchState {
  id: string;
  requestId: string;
  radiusKm: number;
  eligibleCount: number;
  acceptedTechnicianId?: string | null;
  status: "searching" | "assigned" | "cancelled" | "expired";
  canExpand: boolean;
}

export const urgentDispatchApi = {
  start: (requestId: string) => apiClient.request<UrgentDispatchState>(`/repair-requests/${requestId}/urgent-dispatch`, { method: "POST" }, "customer"),
  get: (requestId: string, role: "customer" | "technician") => apiClient.request<UrgentDispatchState>(`/repair-requests/${requestId}/urgent-dispatch`, undefined, role),
  expand: (requestId: string) => apiClient.request<UrgentDispatchState>(`/repair-requests/${requestId}/urgent-dispatch/expand`, { method: "POST" }, "customer"),
  accept: (requestId: string, input: { price: number; etaMinutes?: number }) => apiClient.request<{ id: string; requestId: string; technicianId: string }>(`/repair-requests/${requestId}/urgent-dispatch/accept`, { method: "POST", body: JSON.stringify(input) }, "technician")
};
