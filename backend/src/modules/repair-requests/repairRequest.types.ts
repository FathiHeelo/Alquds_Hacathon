import type { RepairRequestStatus, Urgency } from "../../shared/status";

export interface RepairRequest {
  id: string;
  customerId: string;
  category: string;
  description: string;
  urgency: Urgency;
  status: RepairRequestStatus;
}
