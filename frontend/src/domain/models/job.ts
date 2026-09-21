import type { Technician } from "./technician";

export type JobStatus = "accepted" | "scheduled" | "on_the_way" | "in_progress" | "completed" | "cancelled";
export interface Job { id: string; requestId: string; offerId: string; technicianId: string; status: JobStatus; agreedPrice: number; expectedArrival: string; durationMinutes?: number; locationLabel: string; description?: string; createdAt?: string; conversationId?: string; technicianEarning?: number; technician?: Technician; lastMessage?: { text: string; createdAt: string }; }
