export interface CreateRepairRequestDraft {
  description: string;
  category: string;
  urgency: string;
}

export interface RepairRequestRepository {
  create(draft: CreateRepairRequestDraft): Promise<{ id: string }>;
}
