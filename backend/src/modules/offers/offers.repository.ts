import { Collections, Tx, col, firestore } from "../../database/firestore";
import { round1, tsMillis, withId } from "../../shared/firestore.helpers";
import type { TechnicianProfileDoc } from "../technicians/technicians.repository";

export interface OfferDoc {
  requestId: string;
  technicianId: string;
  price: number;
  message?: string;
  etaMinutes?: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const offers = () => col(Collections.offers);
export const offerDocId = (requestId: string, technicianId: string) => `${requestId}__${technicianId}`;

/** Live join of the technician's public profile/name, matching the frontend's OfferDto.technician shape. */
async function withTechnician<T extends { technicianId: string }>(rows: T[]) {
  if (!rows.length) return rows.map((r) => ({ ...r, technician: undefined }));
  const ids = [...new Set(rows.map((r) => r.technicianId))];
  const [profileSnaps, userSnaps] = await Promise.all([
    firestore.getAll(...ids.map((id) => col(Collections.technicianProfiles).doc(id))),
    firestore.getAll(...ids.map((id) => col(Collections.users).doc(id)))
  ]);
  const profiles = new Map(profileSnaps.map((s) => [s.id, s.data() as TechnicianProfileDoc | undefined]));
  const names = new Map(userSnaps.map((s) => [s.id, (s.data() as { name?: string } | undefined)?.name]));
  return rows.map((r) => {
    const p = profiles.get(r.technicianId);
    return {
      ...r,
      technician: {
        id: r.technicianId,
        name: names.get(r.technicianId) ?? r.technicianId,
        technicianProfile: p && { specialty: p.specialty, isVerified: p.isVerified, isPro: p.isPro, ratingAvg: round1(p.ratingSum, p.ratingCount), ratingCount: p.ratingCount }
      }
    };
  });
}

export const offerRepository = {
  ref: (id: string) => offers().doc(id),
  async create(requestId: string, technicianId: string, input: { price: number; message?: string; etaMinutes?: number }) {
    const now = new Date();
    const doc: OfferDoc = { requestId, technicianId, ...input, status: "pending", createdAt: now, updatedAt: now };
    await offers().doc(offerDocId(requestId, technicianId)).create(doc);
    return (await withTechnician([{ id: offerDocId(requestId, technicianId), ...doc }]))[0];
  },
  findById: async (id: string) => {
    const snap = await offers().doc(id).get();
    return snap.exists ? withId(snap as FirebaseFirestore.DocumentSnapshot<OfferDoc>) : null;
  },
  listForRequest: async (requestId: string) => {
    const snap = await offers().where("requestId", "==", requestId).get();
    const rows = snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<OfferDoc>)).sort((a, b) => a.price - b.price);
    return withTechnician(rows);
  },
  listForTechnician: async (technicianId: string) => {
    const snap = await offers().where("technicianId", "==", technicianId).get();
    return snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<OfferDoc>)).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  },
  setStatus: (id: string, status: OfferDoc["status"], tx?: Tx) => {
    const ref = offers().doc(id);
    const data = { status, updatedAt: new Date() };
    return tx ? tx.update(ref, data) : ref.update(data);
  },
  /** Single-field filter (no composite index needed); status/id narrowed in memory. */
  otherPendingOffers: async (requestId: string, excludeId: string, tx: Tx) => {
    const snap = await tx.get(offers().where("requestId", "==", requestId));
    return snap.docs.filter((d) => d.id !== excludeId && (d.data() as OfferDoc).status === "pending");
  },
  withdraw: async (id: string, technicianId: string) => {
    const ref = offers().doc(id);
    const snap = await ref.get();
    if (!snap.exists || (snap.data() as OfferDoc).technicianId !== technicianId || (snap.data() as OfferDoc).status !== "pending") return false;
    await ref.update({ status: "withdrawn", updatedAt: new Date() });
    return true;
  }
};
