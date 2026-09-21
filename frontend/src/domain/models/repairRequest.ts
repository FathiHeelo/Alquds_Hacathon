import type { Urgency } from "../enums/status";
import type { CustomerLocation, GeoPoint } from "./location";
import type { ServiceCategoryId } from "./technician";
import type { DiagnosisResult } from "@ammerha/ai";

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
  location: RepairRequestLocation;
  media: RequestMedia[];
  voice?: RequestVoice;
  aiSummary?: { diagnosis?: DiagnosisResult };
  createdAt: string;
}

export type RepairRequestLocation = Omit<CustomerLocation, "latitude" | "longitude" | "source"> & Partial<GeoPoint> & { source: "device" | "demo" | "backend" };

export interface RepairRequest extends Omit<RepairRequestDraft, "location"> {
  id: string;
  category: ServiceCategoryId;
  location: RepairRequestLocation;
}
