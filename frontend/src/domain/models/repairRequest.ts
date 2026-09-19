import type { Urgency } from "../enums/status";
import type { CustomerLocation } from "./location";
import type { ServiceCategoryId } from "./technician";

export const PreferredTime = { Asap: "asap", Today: "today", Tomorrow: "tomorrow" } as const;
export type PreferredTime = (typeof PreferredTime)[keyof typeof PreferredTime];

export interface RequestMedia {
  type: "image" | "video";
  uri: string;
  name?: string;
  mimeType?: string;
}

export interface RequestVoice {
  transcript: string;
  source: "ai" | "demo";
}

export interface RepairRequestDraft {
  localId: string;
  customerId: string;
  technicianId?: string;
  description: string;
  category?: ServiceCategoryId;
  urgency: Urgency;
  preferredTime: PreferredTime;
  location: CustomerLocation;
  media: RequestMedia[];
  voice?: RequestVoice;
  createdAt: string;
}

export interface RepairRequest extends RepairRequestDraft {
  id: string;
  category: ServiceCategoryId;
}
