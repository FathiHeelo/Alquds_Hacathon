import { Collections, Tx, col, firestore } from "../../database/firestore";
import { tsMillis, withId } from "../../shared/firestore.helpers";
import type { RepairRequestStatus } from "../../shared/status";

type Media = { url: string; type: "image" | "video" | "audio" };

export interface RepairRequestDoc {
  customerId: string;
  categoryId: string;
  description: string;
  locationSummary?: string;
  area?: string;
  lat?: number;
  lng?: number;
  urgency: "low" | "medium" | "high";
  preferredTime?: Date | FirebaseFirestore.Timestamp;
  status: RepairRequestStatus;
  aiSummary?: Record<string, unknown>;
  media: Media[];
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const requests = () => col(Collections.repairRequests);
const categories = () => col(Collections.serviceCategories);

export const repairRequestRepository = {
  ref: (id: string) => requests().doc(id),
  categories: async () => (await categories().get()).docs.map(withId).sort((a, b) => a.id.localeCompare(b.id)),
  findCategory: async (id: string) => {
    const snap = await categories().doc(id).get();
    return snap.exists ? withId(snap) : null;
  },
  async create(data: Omit<RepairRequestDoc, "createdAt" | "updatedAt" | "media" | "status">, media: Media[]) {
    const now = new Date();
    const ref = requests().doc();
    const doc: RepairRequestDoc = { ...data, status: "open", media, createdAt: now, updatedAt: now };
    await ref.set(doc);
    return { id: ref.id, ...doc };
  },
  findById: async (id: string) => {
    const snap = await requests().doc(id).get();
    return snap.exists ? withId(snap as FirebaseFirestore.DocumentSnapshot<RepairRequestDoc>) : null;
  },
  listByCustomer: async (customerId: string) => {
    const snap = await requests().where("customerId", "==", customerId).get();
    return snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<RepairRequestDoc>)).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  },
  /** `status in [...]` is a single-field filter (no composite index needed); category/area narrowed in memory. */
  feed: async (statuses: RepairRequestStatus[]) => {
    const snap = await requests().where("status", "in", statuses).get();
    return snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<RepairRequestDoc>)).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  },
  update: async (id: string, data: Partial<RepairRequestDoc>) => {
    await requests().doc(id).update({ ...data, updatedAt: new Date() });
    return repairRequestRepository.findById(id);
  },
  replaceMedia: (id: string, media: Media[]) => requests().doc(id).update({ media, updatedAt: new Date() }),
  /** Compare-and-set status; returns true when the transition was applied. */
  transitionStatus: async (id: string, from: RepairRequestStatus[], to: RepairRequestStatus, tx?: Tx) => {
    const ref = requests().doc(id);
    const run = async (t: Tx) => {
      const snap = await t.get(ref);
      if (!snap.exists || !from.includes((snap.data() as RepairRequestDoc).status)) return false;
      t.update(ref, { status: to, updatedAt: new Date() });
      return true;
    };
    return tx ? run(tx) : firestore.runTransaction(run);
  },
  hasTechnicianOffer: async (requestId: string, technicianId: string) => (await col(Collections.offers).doc(`${requestId}__${technicianId}`).get()).exists,
  /** Hard delete: removes the request and any offers left pointing at it (single-field filter, no composite index). */
  async remove(id: string) {
    const offersSnap = await col(Collections.offers).where("requestId", "==", id).get();
    const batch = firestore.batch();
    for (const doc of offersSnap.docs) batch.delete(doc.ref);
    batch.delete(requests().doc(id));
    await batch.commit();
  }
};
