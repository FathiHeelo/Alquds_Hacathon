import type { JobStatus } from "../../shared/status";
import { Collections, Tx, col, firestore } from "../../database/firestore";
import { round1, tsMillis, withId } from "../../shared/firestore.helpers";
import type { TechnicianProfileDoc } from "../technicians/technicians.repository";

export interface JobFinancial {
  labor: number;
  parts: number;
  subtotal: number;
  commissionRate: number;
  platformFee: number;
  total: number;
  technicianEarning: number;
}

export interface JobDoc {
  requestId: string;
  offerId: string;
  customerId: string;
  technicianId: string;
  status: JobStatus;
  scheduledAt?: Date | FirebaseFirestore.Timestamp;
  startedAt?: Date | FirebaseFirestore.Timestamp;
  completedAt?: Date | FirebaseFirestore.Timestamp;
  request: { id: string; categoryId: string; description: string; locationSummary?: string; area?: string; lat?: number; lng?: number; urgency: string; createdAt: Date | FirebaseFirestore.Timestamp };
  offer: {
    price: number;
    etaMinutes?: number;
    technician: { id: string; name: string; technicianProfile: { specialty?: string; isVerified: boolean; isPro: boolean; ratingAvg: number; ratingCount: number } };
  };
  financial?: JobFinancial;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const jobs = () => col(Collections.jobs);

/** Pure assembly (no I/O) — the transaction that calls this must fetch these pieces during its read phase. */
export const buildJobDoc = (params: {
  requestId: string;
  offerId: string;
  customerId: string;
  technicianId: string;
  price: number;
  etaMinutes?: number;
  request: { categoryId: string; description: string; locationSummary?: string; area?: string; lat?: number; lng?: number; urgency: string; createdAt: Date | FirebaseFirestore.Timestamp };
  technicianName: string;
  technicianProfile?: TechnicianProfileDoc;
}): JobDoc => {
  const now = new Date();
  const p = params.technicianProfile;
  return {
    requestId: params.requestId,
    offerId: params.offerId,
    customerId: params.customerId,
    technicianId: params.technicianId,
    status: "accepted",
    request: { id: params.requestId, ...params.request },
    offer: {
      price: params.price,
      etaMinutes: params.etaMinutes,
      technician: {
        id: params.technicianId,
        name: params.technicianName,
        technicianProfile: { specialty: p?.specialty, isVerified: p?.isVerified ?? false, isPro: p?.isPro ?? false, ratingAvg: round1(p?.ratingSum ?? 0, p?.ratingCount ?? 0), ratingCount: p?.ratingCount ?? 0 }
      }
    },
    createdAt: now,
    updatedAt: now
  };
};

type PresentedJob = JobDoc & {
  id: string;
  request: JobDoc["request"] & { status?: string };
  conversation: { id: string; messages: { body?: string; createdAt: unknown }[] };
  review: (FirebaseFirestore.DocumentData & { id: string }) | null;
};

/** Assembles the API shape: the embedded (frozen at creation) request/offer/technician snapshot,
 * overlaid with a live request status (the one field that keeps changing after job creation), plus
 * a last-message preview and the review, if any — matching the old Prisma `include` shape. */
async function present(id: string, data: JobDoc): Promise<PresentedJob> {
  const [requestSnap, messagesSnap, reviewSnap] = await Promise.all([
    col(Collections.repairRequests).doc(data.requestId).get(),
    col(Collections.conversations).doc(id).collection("messages").orderBy("createdAt", "desc").limit(1).get(),
    col(Collections.reviews).doc(id).get()
  ]);
  const last = messagesSnap.docs[0]?.data() as { body?: string; createdAt: unknown } | undefined;
  return {
    id,
    ...data,
    request: { ...data.request, status: (requestSnap.data() as { status?: string } | undefined)?.status },
    conversation: { id, messages: last ? [{ body: last.body, createdAt: last.createdAt }] : [] },
    review: reviewSnap.exists ? withId(reviewSnap) : null
  };
}

export const jobRepository = {
  ref: (id: string) => jobs().doc(id),
  create: (id: string, doc: JobDoc, tx: Tx) => tx.create(jobs().doc(id), doc),
  findById: async (id: string) => {
    const snap = await jobs().doc(id).get();
    return snap.exists ? present(id, snap.data() as JobDoc) : null;
  },
  listForUser: async (field: "customerId" | "technicianId", value: string) => {
    const snap = await jobs().where(field, "==", value).get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as JobDoc) })).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
    return Promise.all(rows.map((r) => present(r.id, r)));
  },
  /** Compare-and-set on status so concurrent transitions cannot both win. */
  transition: async (id: string, from: JobStatus, data: Partial<JobDoc>, tx?: Tx) => {
    const ref = jobs().doc(id);
    const run = async (t: Tx) => {
      const snap = await t.get(ref);
      if (!snap.exists || (snap.data() as JobDoc).status !== from) return false;
      t.update(ref, { ...data, updatedAt: new Date() });
      return true;
    };
    return tx ? run(tx) : firestore.runTransaction(run);
  }
};
