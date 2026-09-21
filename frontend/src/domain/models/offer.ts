import type { Technician } from "./technician";

export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Offer {
  id: string;
  repairRequestId: string;
  technicianId: string;
  price: number;
  message: string;
  estimatedDurationMinutes?: number;
  etaMinutes?: number;
  status: OfferStatus;
  createdAt: string;
  technician?: Technician;
}

export interface AcceptedOfferHandoff {
  jobId: string;
  requestId: string;
  offerId: string;
  technicianId: string;
}
