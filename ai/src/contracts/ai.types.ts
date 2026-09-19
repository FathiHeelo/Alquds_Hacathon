export type RepairCategory =
  | "plumbing"
  | "electrical"
  | "ac"
  | "appliance"
  | "general";

export type Urgency =
  | "low"
  | "medium"
  | "high";

export type TechnicianType =
  | "plumber"
  | "electrician"
  | "ac_technician"
  | "appliance_technician"
  | "general_technician";

export type ConfidenceLevel =
  | "low"
  | "medium"
  | "high";

export type PriceStatus =
  | "fair"
  | "slightly_high"
  | "high"
  | "low"
  | "insufficient_data";

export type RiskSeverity =
  | "low"
  | "medium"
  | "high";

export interface RepairRequestContext {
  description: string;
  category: RepairCategory;
  urgency: Urgency;
  technicianType: TechnicianType;
}