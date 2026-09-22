import type { RepairRequest, RepairRequestDraft } from "../models/repairRequest";
import type { TechnicianRequestItem } from "../../features/technician/technicianData";

export type CreateRepairRequestDraft = RepairRequestDraft;

export interface RepairRequestRepository {
  create(draft: CreateRepairRequestDraft): Promise<RepairRequest>;
  getRequest(id: string): Promise<RepairRequest | undefined>;
  listMine(): Promise<readonly RepairRequest[]>;
  listForTechnician(): Promise<readonly TechnicianRequestItem[]>;
  updateAiAssessment(id: string, diagnosis: NonNullable<RepairRequest["aiSummary"]>["diagnosis"]): Promise<RepairRequest>;
  /** Hard delete: removes the request from the database. Only allowed before a technician is on the job. */
  remove(id: string): Promise<void>;
}
