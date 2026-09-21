import { Prisma } from "@prisma/client";

import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { chatRepository } from "../chat/chat.repository";
import { jobRepository } from "../jobs/jobs.repository";
import { NotificationType, notify } from "../notifications/notifications.service";
import { repairRequestService } from "../repair-requests/repairRequest.service";

const radii = env.urgentDispatchRadiiKm.length ? env.urgentDispatchRadiiKm : [3, 6, 9];
const toRadians = (value: number) => value * Math.PI / 180;
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadius = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

type AiSummary = { diagnosis?: { routing?: { type?: string } } };
const ids = (value: Prisma.JsonValue): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const present = (dispatch: { id: string; requestId: string; radiusKm: number; eligibleTechnicianIds: Prisma.JsonValue; acceptedTechnicianId: string | null; status: string; createdAt: Date; updatedAt: Date }) => ({
  id: dispatch.id,
  requestId: dispatch.requestId,
  radiusKm: dispatch.radiusKm,
  eligibleCount: ids(dispatch.eligibleTechnicianIds).length,
  acceptedTechnicianId: dispatch.acceptedTechnicianId,
  status: dispatch.status,
  canExpand: dispatch.radiusKm < Math.max(...radii),
  createdAt: dispatch.createdAt,
  updatedAt: dispatch.updatedAt
});

async function eligibleTechnicians(request: { categoryId: string; lat: number | null; lng: number | null }, radiusKm: number) {
  if (request.lat == null || request.lng == null) throw new AppError(ErrorCode.ValidationError, "A valid request location is required for urgent dispatch", 400);
  const profiles = await prisma.technicianProfile.findMany({
    where: {
      specialty: request.categoryId,
      isVerified: true,
      verificationStatus: "approved",
      availability: "available",
      acceptsUrgentRequests: true,
      lat: { not: null },
      lng: { not: null },
      user: { status: "active" }
    },
    orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }]
  });
  return profiles
    .map((profile) => ({ id: profile.userId, distance: distanceKm({ lat: request.lat!, lng: request.lng! }, { lat: profile.lat!, lng: profile.lng! }), rating: profile.ratingAvg }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance || b.rating - a.rating);
}

async function notifyCandidates(candidateIds: readonly string[], requestId: string, radiusKm: number) {
  await Promise.all(candidateIds.map((technicianId) => notify(technicianId, NotificationType.UrgentDispatch, "Urgent maintenance request", `Eligible request within ${radiusKm} km`, { requestId, radiusKm })));
}

export const urgentDispatchService = {
  async start(requestId: string, customerId: string) {
    const request = await repairRequestService.ownedOpenRequest(requestId, customerId);
    const routingType = (request.aiSummary as AiSummary | null)?.diagnosis?.routing?.type;
    if (request.urgency !== "high" || routingType !== "URGENT_TECHNICIAN") throw new AppError(ErrorCode.InvalidRequestState, "This request is not classified for urgent technician dispatch", 409);
    const existing = await prisma.urgentDispatch.findUnique({ where: { requestId } });
    if (existing) return present(existing);
    const radiusKm = radii[0]!;
    const candidates = await eligibleTechnicians(request, radiusKm);
    const dispatch = await prisma.urgentDispatch.upsert({ where: { requestId }, update: {}, create: { requestId, radiusKm, eligibleTechnicianIds: candidates.map(({ id }) => id) } });
    await notifyCandidates(candidates.map(({ id }) => id), requestId, radiusKm);
    return present(dispatch);
  },

  async get(requestId: string, user: { id: string; role: "customer" | "technician" | "admin" }) {
    const dispatch = await prisma.urgentDispatch.findUnique({ where: { requestId }, include: { request: true } });
    if (!dispatch) throw new AppError(ErrorCode.NotFound, "Urgent dispatch not found", 404);
    if (user.role !== "admin" && dispatch.request.customerId !== user.id && !ids(dispatch.eligibleTechnicianIds).includes(user.id)) throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this dispatch", 403);
    return present(dispatch);
  },

  async expand(requestId: string, customerId: string) {
    const request = await repairRequestService.ownedOpenRequest(requestId, customerId);
    const dispatch = await prisma.urgentDispatch.findUnique({ where: { requestId } });
    if (!dispatch || dispatch.status !== "searching") throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is not searching", 409);
    const currentIndex = radii.findIndex((radius) => radius === dispatch.radiusKm);
    const nextRadius = radii[currentIndex + 1];
    if (!nextRadius) throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is already at the maximum radius", 409);
    const candidates = await eligibleTechnicians(request, nextRadius);
    const previous = new Set(ids(dispatch.eligibleTechnicianIds));
    const expanded = await prisma.urgentDispatch.updateMany({ where: { id: dispatch.id, status: "searching", radiusKm: dispatch.radiusKm }, data: { radiusKm: nextRadius, eligibleTechnicianIds: candidates.map(({ id }) => id) } });
    if (expanded.count !== 1) throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch changed while expanding", 409);
    const updated = await prisma.urgentDispatch.findUniqueOrThrow({ where: { id: dispatch.id } });
    await notifyCandidates(candidates.map(({ id }) => id).filter((id) => !previous.has(id)), requestId, nextRadius);
    return present(updated);
  },

  async accept(requestId: string, technicianId: string, input: { price: number; etaMinutes?: number }) {
    const dispatch = await prisma.urgentDispatch.findUnique({ where: { requestId }, include: { request: true } });
    if (!dispatch || dispatch.status !== "searching") throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is no longer available", 409);
    if (!ids(dispatch.eligibleTechnicianIds).includes(technicianId)) throw new AppError(ErrorCode.PermissionDenied, "Technician is not eligible in the current dispatch radius", 403);

    const jobId = await prisma.$transaction(async (tx) => {
      const profile = await tx.technicianProfile.findUnique({ where: { userId: technicianId }, include: { user: true } });
      const requestLocationValid = dispatch.request.lat != null && dispatch.request.lng != null;
      const technicianLocationValid = profile?.lat != null && profile.lng != null;
      const stillWithinRadius = requestLocationValid && technicianLocationValid
        ? distanceKm(
            { lat: dispatch.request.lat!, lng: dispatch.request.lng! },
            { lat: profile.lat!, lng: profile.lng! }
          ) <= dispatch.radiusKm
        : false;
      if (!profile || profile.specialty !== dispatch.request.categoryId || !profile.isVerified || profile.verificationStatus !== "approved" || profile.availability !== "available" || !profile.acceptsUrgentRequests || profile.user.status !== "active" || !stillWithinRadius) {
        throw new AppError(ErrorCode.PermissionDenied, "Technician is no longer eligible for this urgent dispatch", 403);
      }
      const claimed = await tx.urgentDispatch.updateMany({ where: { id: dispatch.id, status: "searching", acceptedTechnicianId: null }, data: { status: "assigned", acceptedTechnicianId: technicianId } });
      if (claimed.count !== 1) throw new AppError(ErrorCode.OfferAlreadyAccepted, "Another technician already accepted this urgent request", 409);
      const transitioned = await tx.repairRequest.updateMany({ where: { id: requestId, status: { in: ["open", "matched"] } }, data: { status: "accepted" } });
      if (transitioned.count !== 1) throw new AppError(ErrorCode.OfferAlreadyAccepted, "The request was already assigned", 409);

      const existingOffer = await tx.offer.findUnique({ where: { requestId_technicianId: { requestId, technicianId } } });
      const offer = existingOffer
        ? await tx.offer.update({ where: { id: existingOffer.id }, data: { price: input.price, etaMinutes: input.etaMinutes, status: "accepted", message: "Urgent dispatch accepted in AMMERHA" } })
        : await tx.offer.create({ data: { requestId, technicianId, price: input.price, etaMinutes: input.etaMinutes, status: "accepted", message: "Urgent dispatch accepted in AMMERHA" } });
      await tx.offer.updateMany({ where: { requestId, id: { not: offer.id }, status: "pending" }, data: { status: "rejected" } });
      const job = await jobRepository.create({ requestId, offerId: offer.id, customerId: dispatch.request.customerId, technicianId, status: "accepted" }, tx);
      await chatRepository.createConversation({ jobId: job.id, customerId: dispatch.request.customerId, technicianId }, tx);
      await notify(dispatch.request.customerId, NotificationType.UrgentDispatchAccepted, "Urgent technician assigned", undefined, { jobId: job.id, requestId, technicianId }, tx);
      return job.id;
    });
    return jobRepository.findById(jobId);
  }
};
