import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { col, Collections } from "../../database/firestore";
import type { UserRole } from "../../shared/status";
import { repairRequestRepository as repo } from "./repairRequest.repository";

type Media = { url: string; type: "image" | "video" | "audio" };

export interface RequestInput {
  categoryId: string;
  description: string;
  locationSummary?: string;
  area?: string;
  lat?: number;
  lng?: number;
  urgency?: "low" | "medium" | "high";
  preferredTime?: Date;
  aiSummary?: Record<string, unknown>;
  media?: Media[];
}

const notFound = () => new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
const OPEN_STATES = ["open", "matched"] as const;

export const repairRequestService = {
  categories: () => repo.categories(),

  async create(customerId: string, input: RequestInput) {
    if (!(await repo.findCategory(input.categoryId))) throw new AppError(ErrorCode.ValidationError, "Unknown category", 400);
    const { media = [], urgency = "medium", ...data } = input;
    return repo.create({ ...data, urgency, customerId }, media);
  },

  listMine: (customerId: string) => repo.listByCustomer(customerId),

  /** Open requests matching the technician's specialty and service areas. */
  async feed(technicianId: string) {
    const profileSnap = await col(Collections.technicianProfiles).doc(technicianId).get();
    const profile = profileSnap.data() as { specialty?: string; serviceAreas?: string[] } | undefined;
    const areas = profile?.serviceAreas ?? [];
    const all = await repo.feed([...OPEN_STATES]);
    return all.filter((r) => (!profile?.specialty || r.categoryId === profile.specialty) && (!areas.length || !r.area || areas.includes(r.area)));
  },

  async getForUser(id: string, user: { id: string; role: UserRole }) {
    const request = await repo.findById(id);
    if (!request) throw notFound();
    if (user.role === "admin" || request.customerId === user.id) return request;
    if (user.role === "technician" && ((OPEN_STATES as readonly string[]).includes(request.status) || (await repo.hasTechnicianOffer(id, user.id)))) {
      return request;
    }
    throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this request", 403);
  },

  async update(id: string, customerId: string, input: Partial<RequestInput>) {
    const request = await this.ownedOpenRequest(id, customerId);
    if (input.categoryId && !(await repo.findCategory(input.categoryId))) throw new AppError(ErrorCode.ValidationError, "Unknown category", 400);
    const { media, ...data } = input;
    if (media) await repo.replaceMedia(request.id, media);
    return repo.update(id, data);
  },

  async cancel(id: string, customerId: string) {
    await this.ownedOpenRequest(id, customerId);
    // Compare-and-set so an offer accepted concurrently cannot be cancelled underneath.
    if (!(await repo.transitionStatus(id, [...OPEN_STATES], "cancelled"))) {
      throw new AppError(ErrorCode.InvalidRequestState, "Request can no longer be cancelled", 409);
    }
    return repo.findById(id);
  },

  /** Update/cancel guard: only the owner, and only while open/matched. Also used by urgent dispatch. */
  async ownedOpenRequest(id: string, customerId: string) {
    const request = await repo.findById(id);
    if (!request) throw notFound();
    if (request.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your request", 403);
    if (!(OPEN_STATES as readonly string[]).includes(request.status)) {
      throw new AppError(ErrorCode.InvalidRequestState, `Request is ${request.status} and cannot be changed`, 409);
    }
    return request;
  }
};
