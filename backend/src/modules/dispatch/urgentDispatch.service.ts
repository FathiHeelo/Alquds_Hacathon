import { env } from "../../config/env";
import { Collections, col, firestore } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { withId } from "../../shared/firestore.helpers";
import type { TechnicianProfileDoc } from "../technicians/technicians.repository";
import { buildJobDoc, jobRepository } from "../jobs/jobs.repository";
import { NotificationType, notify } from "../notifications/notifications.service";
import { offerDocId, offerRepository } from "../offers/offers.repository";
import { repairRequestRepository } from "../repair-requests/repairRequest.repository";
import { repairRequestService } from "../repair-requests/repairRequest.service";
import { technicianRepository } from "../technicians/technicians.repository";

interface DispatchDoc {
  requestId: string;
  radiusKm: number;
  eligibleTechnicianIds: string[];
  acceptedTechnicianId: string | null;
  status: "searching" | "assigned" | "cancelled" | "expired";
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const dispatches = () => col(Collections.urgentDispatches);
const radii = env.urgentDispatchRadiiKm.length ? env.urgentDispatchRadiiKm : [3, 6, 9];

const toRadians = (value: number) => (value * Math.PI) / 180;
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadius = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const present = (dispatch: DispatchDoc & { id: string }) => ({
  id: dispatch.id,
  requestId: dispatch.requestId,
  radiusKm: dispatch.radiusKm,
  eligibleCount: dispatch.eligibleTechnicianIds.length,
  acceptedTechnicianId: dispatch.acceptedTechnicianId,
  status: dispatch.status,
  canExpand: dispatch.radiusKm < Math.max(...radii),
  createdAt: dispatch.createdAt,
  updatedAt: dispatch.updatedAt
});

/** `specialty == categoryId` is the only server-side filter (single field, no composite index); the
 * rest (verification, availability, urgent opt-in, account status, radius) is checked in memory —
 * the candidate pool is hackathon-scale, so this stays cheap. */
async function eligibleTechnicians(request: { categoryId: string; lat?: number; lng?: number }, radiusKm: number) {
  if (request.lat == null || request.lng == null) throw new AppError(ErrorCode.ValidationError, "A valid request location is required for urgent dispatch", 400);
  const snap = await col(Collections.technicianProfiles).where("specialty", "==", request.categoryId).get();
  const candidates = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as TechnicianProfileDoc) }))
    .filter((p) => p.isVerified && p.verificationStatus === "approved" && p.availability === "available" && p.acceptsUrgentRequests && p.lat != null && p.lng != null);
  if (!candidates.length) return [];

  const userSnaps = await firestore.getAll(...candidates.map((c) => col(Collections.users).doc(c.id)));
  const activeIds = new Set(userSnaps.filter((s) => (s.data() as { status?: string } | undefined)?.status === "active").map((s) => s.id));

  return candidates
    .filter((c) => activeIds.has(c.id))
    .map((p) => ({ id: p.id, distance: distanceKm({ lat: request.lat!, lng: request.lng! }, { lat: p.lat!, lng: p.lng! }), rating: p.ratingSum / (p.ratingCount || 1) }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance || b.rating - a.rating);
}

const notifyCandidates = (candidateIds: readonly string[], requestId: string, radiusKm: number) =>
  Promise.all(candidateIds.map((technicianId) => notify(technicianId, NotificationType.UrgentDispatch, "Urgent maintenance request", `Eligible request within ${radiusKm} km`, { requestId, radiusKm })));

export const urgentDispatchService = {
  async start(requestId: string, customerId: string) {
    const request = await repairRequestService.ownedOpenRequest(requestId, customerId);
    const routingType = (request.aiSummary as { diagnosis?: { routing?: { type?: string } } } | undefined)?.diagnosis?.routing?.type;
    if (request.urgency !== "high" || routingType !== "URGENT_TECHNICIAN") throw new AppError(ErrorCode.InvalidRequestState, "This request is not classified for urgent technician dispatch", 409);

    const existing = await dispatches().doc(requestId).get();
    if (existing.exists) return present(withId(existing as FirebaseFirestore.DocumentSnapshot<DispatchDoc>));

    const radiusKm = radii[0]!;
    const candidates = await eligibleTechnicians(request, radiusKm);
    const now = new Date();
    const doc: DispatchDoc = { requestId, radiusKm, eligibleTechnicianIds: candidates.map(({ id }) => id), acceptedTechnicianId: null, status: "searching", createdAt: now, updatedAt: now };
    try {
      await dispatches().doc(requestId).create(doc);
    } catch {
      // Lost the create race to a concurrent request for the same dispatch; use whichever won.
      const winner = await dispatches().doc(requestId).get();
      return present(withId(winner as FirebaseFirestore.DocumentSnapshot<DispatchDoc>));
    }
    await notifyCandidates(candidates.map(({ id }) => id), requestId, radiusKm);
    return present({ id: requestId, ...doc });
  },

  async get(requestId: string, user: { id: string; role: string }) {
    const snap = await dispatches().doc(requestId).get();
    if (!snap.exists) throw new AppError(ErrorCode.NotFound, "Urgent dispatch not found", 404);
    const dispatch = withId(snap as FirebaseFirestore.DocumentSnapshot<DispatchDoc>);
    const request = await repairRequestRepository.findById(requestId);
    if (user.role !== "admin" && request?.customerId !== user.id && !dispatch.eligibleTechnicianIds.includes(user.id)) {
      throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this dispatch", 403);
    }
    return present(dispatch);
  },

  async expand(requestId: string, customerId: string) {
    const request = await repairRequestService.ownedOpenRequest(requestId, customerId);
    const snap = await dispatches().doc(requestId).get();
    if (!snap.exists || (snap.data() as DispatchDoc).status !== "searching") throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is not searching", 409);
    const dispatch = withId(snap as FirebaseFirestore.DocumentSnapshot<DispatchDoc>);

    const currentIndex = radii.findIndex((radius) => radius === dispatch.radiusKm);
    const nextRadius = radii[currentIndex + 1];
    if (!nextRadius) throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is already at the maximum radius", 409);

    const candidates = await eligibleTechnicians(request, nextRadius);
    const previous = new Set(dispatch.eligibleTechnicianIds);
    const ref = dispatches().doc(requestId);
    const expanded = await firestore.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      const data = current.data() as DispatchDoc;
      if (data.status !== "searching" || data.radiusKm !== dispatch.radiusKm) return false;
      tx.update(ref, { radiusKm: nextRadius, eligibleTechnicianIds: candidates.map(({ id }) => id), updatedAt: new Date() });
      return true;
    });
    if (!expanded) throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch changed while expanding", 409);

    await notifyCandidates(candidates.map(({ id }) => id).filter((id) => !previous.has(id)), requestId, nextRadius);
    const updated = await ref.get();
    return present(withId(updated as FirebaseFirestore.DocumentSnapshot<DispatchDoc>));
  },

  /**
   * All reads (dispatch, request, existing offer if any, other pending offers) happen up front; then
   * every write. Re-checking dispatch.status/acceptedTechnicianId at commit time means only one
   * concurrent accept can ever win.
   */
  async accept(requestId: string, technicianId: string, input: { price: number; etaMinutes?: number }) {
    const dispatchSnap = await dispatches().doc(requestId).get();
    if (!dispatchSnap.exists || (dispatchSnap.data() as DispatchDoc).status !== "searching") throw new AppError(ErrorCode.InvalidRequestState, "Urgent dispatch is no longer available", 409);
    const dispatch = withId(dispatchSnap as FirebaseFirestore.DocumentSnapshot<DispatchDoc>);
    if (!dispatch.eligibleTechnicianIds.includes(technicianId)) throw new AppError(ErrorCode.PermissionDenied, "Technician is not eligible in the current dispatch radius", 403);

    const request = await repairRequestRepository.findById(requestId);
    if (!request) throw new AppError(ErrorCode.RequestNotFound, "Repair request not found", 404);
    const [profile, userSnap] = await Promise.all([technicianRepository.findProfile(technicianId), col(Collections.users).doc(technicianId).get()]);
    const userStatus = (userSnap.data() as { status?: string } | undefined)?.status;
    const withinRadius = request.lat != null && request.lng != null && profile?.lat != null && profile?.lng != null
      ? distanceKm({ lat: request.lat, lng: request.lng }, { lat: profile.lat, lng: profile.lng }) <= dispatch.radiusKm
      : false;
    if (!profile || profile.specialty !== request.categoryId || !profile.isVerified || profile.verificationStatus !== "approved" || profile.availability !== "available" || !profile.acceptsUrgentRequests || userStatus !== "active" || !withinRadius) {
      throw new AppError(ErrorCode.PermissionDenied, "Technician is no longer eligible for this urgent dispatch", 403);
    }

    const offerId = offerDocId(requestId, technicianId);
    await firestore.runTransaction(async (tx) => {
      const dispatchRef = dispatches().doc(requestId);
      const requestRef = repairRequestRepository.ref(requestId);
      const offerRef = offerRepository.ref(offerId);
      const [dispatchFresh, requestFresh, offerFresh, others] = await Promise.all([
        tx.get(dispatchRef),
        tx.get(requestRef),
        tx.get(offerRef),
        offerRepository.otherPendingOffers(requestId, offerId, tx)
      ]);
      const dispatchData = dispatchFresh.data() as DispatchDoc | undefined;
      const requestData = requestFresh.data() as { status: string } | undefined;
      if (!dispatchData || dispatchData.status !== "searching" || dispatchData.acceptedTechnicianId || !requestData || !["open", "matched"].includes(requestData.status)) {
        throw new AppError(ErrorCode.OfferAlreadyAccepted, "Another technician already accepted this urgent request", 409);
      }

      tx.update(dispatchRef, { status: "assigned", acceptedTechnicianId: technicianId, updatedAt: new Date() });
      tx.update(requestRef, { status: "accepted", updatedAt: new Date() });
      const offerData = { requestId, technicianId, price: input.price, etaMinutes: input.etaMinutes, status: "accepted" as const, message: "Urgent dispatch accepted in AMMERHA", updatedAt: new Date() };
      if (offerFresh.exists) tx.update(offerRef, offerData);
      else tx.create(offerRef, { ...offerData, createdAt: new Date() });
      for (const other of others) tx.update(other.ref, { status: "rejected", updatedAt: new Date() });

      const jobDoc = buildJobDoc({
        requestId,
        offerId,
        customerId: request.customerId,
        technicianId,
        price: input.price,
        etaMinutes: input.etaMinutes,
        request: { categoryId: request.categoryId, description: request.description, locationSummary: request.locationSummary, area: request.area, lat: request.lat, lng: request.lng, urgency: request.urgency, createdAt: request.createdAt },
        technicianName: profile.user.name ?? technicianId,
        technicianProfile: profile
      });
      jobRepository.create(offerId, jobDoc, tx);
      tx.create(col(Collections.conversations).doc(offerId), { jobId: offerId, customerId: request.customerId, technicianId, createdAt: new Date() });
    });

    await notify(request.customerId, NotificationType.UrgentDispatchAccepted, "Urgent technician assigned", undefined, { jobId: offerId, requestId, technicianId });
    return jobRepository.findById(offerId);
  }
};
