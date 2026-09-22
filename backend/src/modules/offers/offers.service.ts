import { Collections, col, firestore } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { NotificationType, notify } from "../notifications/notifications.service";
import { repairRequestRepository } from "../repair-requests/repairRequest.repository";
import { technicianRepository } from "../technicians/technicians.repository";
import { buildJobDoc, jobRepository } from "../jobs/jobs.repository";
import { offerDocId, offerRepository, type OfferDoc } from "./offers.repository";

export interface OfferInput {
  price: number;
  message?: string;
  etaMinutes?: number;
}

export const offerService = {
  async create(requestId: string, technicianId: string, input: OfferInput) {
    const request = await repairRequestRepository.findById(requestId);
    if (!request) throw new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
    if (!["open", "matched"].includes(request.status)) {
      throw new AppError(ErrorCode.InvalidRequestState, "Request is no longer accepting offers", 409);
    }

    let offer;
    try {
      offer = await offerRepository.create(requestId, technicianId, input);
    } catch {
      // `create()` failed its ALREADY_EXISTS precondition on the deterministic (requestId, technicianId) doc id.
      throw new AppError(ErrorCode.Conflict, "You already sent an offer for this request", 409);
    }

    await repairRequestRepository.transitionStatus(requestId, ["open"], "matched");
    await notify(request.customerId, NotificationType.NewOffer, "New offer received", undefined, { requestId, offerId: offer.id });
    return offer;
  },

  async listForRequest(requestId: string, customerId: string) {
    const request = await repairRequestRepository.findById(requestId);
    if (!request) throw new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
    if (request.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your request", 403);
    return offerRepository.listForRequest(requestId);
  },

  listMine: (technicianId: string) => offerRepository.listForTechnician(technicianId),

  async withdraw(offerId: string, technicianId: string) {
    if (!(await offerRepository.withdraw(offerId, technicianId))) throw new AppError(ErrorCode.OfferNotFound, "Pending offer not found", 404);
    return { id: offerId, status: "withdrawn" };
  },

  /**
   * Accepts exactly one offer per request. All reads happen up front (offer, request, other pending
   * offers), then every write; the request's status is re-checked at commit time, so two concurrent
   * accepts can never both win — the loser gets OFFER_ALREADY_ACCEPTED.
   */
  async accept(offerId: string, customerId: string) {
    const offer = await offerRepository.findById(offerId);
    if (!offer) throw new AppError(ErrorCode.OfferNotFound, "Offer not found", 404);
    const request = await repairRequestRepository.findById(offer.requestId);
    if (!request) throw new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
    if (request.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your request", 403);
    if (offer.status !== "pending") throw new AppError(ErrorCode.OfferAlreadyAccepted, `Offer is already ${offer.status}`, 409);

    const technicianProfile = await technicianRepository.findProfile(offer.technicianId);

    await firestore.runTransaction(async (tx) => {
      const requestRef = repairRequestRepository.ref(offer.requestId);
      const offerRef = offerRepository.ref(offerId);
      const [requestSnap, offerSnap, others] = await Promise.all([
        tx.get(requestRef),
        tx.get(offerRef),
        offerRepository.otherPendingOffers(offer.requestId, offerId, tx)
      ]);
      const requestData = requestSnap.data() as { status: string; customerId: string } | undefined;
      const offerData = offerSnap.data() as OfferDoc | undefined;
      if (!requestData || !["open", "matched"].includes(requestData.status) || !offerData || offerData.status !== "pending") {
        throw new AppError(ErrorCode.OfferAlreadyAccepted, "An offer was already accepted for this request", 409);
      }

      tx.update(requestRef, { status: "accepted", updatedAt: new Date() });
      tx.update(offerRef, { status: "accepted", updatedAt: new Date() });
      for (const other of others) tx.update(other.ref, { status: "rejected", updatedAt: new Date() });

      const jobDoc = buildJobDoc({
        requestId: offer.requestId,
        offerId,
        customerId,
        technicianId: offer.technicianId,
        price: offer.price,
        etaMinutes: offer.etaMinutes,
        request: { categoryId: request.categoryId, description: request.description, locationSummary: request.locationSummary, area: request.area, lat: request.lat, lng: request.lng, urgency: request.urgency, createdAt: request.createdAt },
        technicianName: technicianProfile?.user.name ?? offer.technicianId,
        technicianProfile: technicianProfile ?? undefined
      });
      jobRepository.create(offerId, jobDoc, tx);
      tx.create(col(Collections.conversations).doc(offerId), { jobId: offerId, customerId, technicianId: offer.technicianId, createdAt: new Date() });
    });

    await notify(offer.technicianId, NotificationType.OfferAccepted, "Your offer was accepted", undefined, { jobId: offerId, requestId: offer.requestId });
    return jobRepository.findById(offerId);
  }
};
