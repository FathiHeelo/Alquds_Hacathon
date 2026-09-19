import type {
  CreateRepairRequestDraft,
  RepairRequestRepository
} from "../../domain/contracts/repairRequestRepository";
import type { RepairRequest } from "../../domain/models/repairRequest";
import { technicianRequests } from "../../features/technician/technicianData";
import { validateRepairRequest } from "../../features/repair-request/services/requestValidation";
import { AppError } from "../../shared/errors/AppError";

function copy(request: RepairRequest): RepairRequest {
  return JSON.parse(JSON.stringify(request)) as RepairRequest;
}

export class DemoRepairRequestRepository implements RepairRequestRepository {
  private nextId = 1;
  private requests = new Map<string, RepairRequest>();

  async create(draft: CreateRepairRequestDraft): Promise<RepairRequest> {
    const errors = validateRepairRequest(draft);
    if (Object.keys(errors).length) throw new AppError("VALIDATION_ERROR", Object.values(errors)[0]!);
    const existing = [...this.requests.values()].find((request) => request.localId === draft.localId);
    if (existing) return copy(existing);
    const request: RepairRequest = copy({ ...draft, description: draft.description.trim(),
      category: draft.category!, id: `demo-request-${this.nextId++}` });
    this.requests.set(request.id, request);
    return copy(request);
  }

  async getRequest(id: string): Promise<RepairRequest | undefined> {
    const request = this.requests.get(id);
    return request ? copy(request) : undefined;
  }

  async listMine(): Promise<readonly RepairRequest[]> {
    return [...this.requests.values()].map(copy);
  }

  async listForTechnician() {
    return technicianRequests;
  }
}
