import type { RepairRequest, RepairRequestDraft } from "../models/repairRequest";
import type { TechnicianRequestItem } from "../../features/technician/technicianData";

export type CreateRepairRequestDraft = RepairRequestDraft;

export interface RepairRequestRepository {
  create(draft: CreateRepairRequestDraft): Promise<RepairRequest>;
  getRequest(id: string): Promise<RepairRequest | undefined>;
  listMine(): Promise<readonly RepairRequest[]>;
  listForTechnician(): Promise<readonly TechnicianRequestItem[]>;
}
