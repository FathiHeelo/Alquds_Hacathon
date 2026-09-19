import type { RepairRequest, RepairRequestDraft } from "../models/repairRequest";

export type CreateRepairRequestDraft = RepairRequestDraft;

export interface RepairRequestRepository {
  create(draft: CreateRepairRequestDraft): Promise<RepairRequest>;
  getRequest(id: string): Promise<RepairRequest | undefined>;
  listMine(): Promise<readonly RepairRequest[]>;
  listForTechnician(): Promise<readonly RepairRequest[]>;
}
