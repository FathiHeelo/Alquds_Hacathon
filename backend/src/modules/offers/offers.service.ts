import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { num } from "../../shared/money";
import { chatRepository } from "../chat/chat.repository";
import { jobRepository } from "../jobs/jobs.repository";
import { NotificationType, notify } from "../notifications/notifications.service";
import { repairRequestRepository } from "../repair-requests/repairRequest.repository";
import { offerRepository } from "./offers.repository";

const present = <T extends { price: Prisma.Decimal }>(offer: T) => ({ ...offer, price: num(offer.price) });

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
      offer = await offerRepository.create({ requestId, technicianId, ...input });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(ErrorCode.Conflict, "You already sent an offer for this request", 409);
      }
      throw error;
    }

    await repairRequestRepository.transitionStatus(requestId, ["open"], "matched");
    await notify(request.customerId, NotificationType.NewOffer, "وصلك عرض صيانة جديد", "افتح الطلب لمراجعة عرض الفني والسعر ووقت الوصول.", { requestId, offerId: offer.id });
    return present(offer);
  },

  async listForRequest(requestId: string, customerId: string) {
    const request = await repairRequestRepository.findById(requestId);
    if (!request) throw new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
    if (request.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your request", 403);
    return (await offerRepository.listForRequest(requestId)).map(present);
  },

  async listMine(technicianId: string) {
    return (await offerRepository.listForTechnician(technicianId)).map(present);
  },

  async withdraw(offerId: string, technicianId: string) {
    const result = await offerRepository.withdraw(offerId, technicianId);
    if (result.count !== 1) throw new AppError(ErrorCode.OfferNotFound, "Pending offer not found", 404);
    return { id: offerId, status: "withdrawn" };
  },

  /**
   * Accepts exactly one offer per request. The request status compare-and-set inside the
   * transaction guarantees only one concurrent accept wins; the loser gets OFFER_ALREADY_ACCEPTED.
   */
  async accept(offerId: string, customerId: string) {
    const offer = await offerRepository.findById(offerId);
    if (!offer) throw new AppError(ErrorCode.OfferNotFound, "Offer not found", 404);
    if (offer.request.customerId !== customerId) throw new AppError(ErrorCode.PermissionDenied, "Not your request", 403);
    if (offer.status !== "pending") throw new AppError(ErrorCode.OfferAlreadyAccepted, `Offer is already ${offer.status}`, 409);

    const jobId = await prisma.$transaction(async (tx) => {
      if (!(await repairRequestRepository.transitionStatus(offer.requestId, ["open", "matched"], "accepted", tx))) {
        throw new AppError(ErrorCode.OfferAlreadyAccepted, "An offer was already accepted for this request", 409);
      }
      await offerRepository.setStatus(offerId, "accepted", tx);
      await offerRepository.rejectOthers(offer.requestId, offerId, tx);

      const job = await jobRepository.create(
        { requestId: offer.requestId, offerId, customerId, technicianId: offer.technicianId, status: "accepted" },
        tx
      );
      await chatRepository.createConversation({ jobId: job.id, customerId, technicianId: offer.technicianId }, tx);
      await notify(offer.technicianId, NotificationType.OfferAccepted, "Your offer was accepted", undefined, { jobId: job.id, requestId: offer.requestId }, tx);
      return job.id;
    });

    return jobRepository.findById(jobId);
  }
};
