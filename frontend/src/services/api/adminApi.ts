import { apiClient } from "./apiClient";
export const adminApi = {
  summary: () => apiClient.request<Record<string, unknown>>("/admin/summary", undefined, "admin"),
  verificationQueue: () => apiClient.request<unknown[]>("/admin/technicians/verification", undefined, "admin"),
  decideVerification: (userId: string, decision: "approve" | "reject", note?: string) => apiClient.request(`/admin/technicians/${userId}/verification`, { method: "POST", body: JSON.stringify({ decision, note }) }, "admin"),
  reports: () => apiClient.request<unknown[]>("/admin/reports", undefined, "admin"),
  setReportStatus: (id: string, status: "open" | "reviewed" | "dismissed") => apiClient.request(`/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, "admin"),
  risks: () => apiClient.request<unknown[]>("/admin/risk-assessments", undefined, "admin"),
  reviewRisk: (id: string, status: "reviewed" | "dismissed", note?: string) => apiClient.request(`/admin/risk-assessments/${id}/review`, { method: "POST", body: JSON.stringify({ status, note }) }, "admin")
};
