import { Collections, FieldValue, col } from "../../database/firestore";
import { tsMillis, withId } from "../../shared/firestore.helpers";

export interface TechnicianProfileDoc {
  specialty?: string;
  yearsExperience: number;
  serviceAreas: string[];
  availability: "available" | "busy" | "offline";
  verificationStatus: "pending" | "approved" | "rejected";
  isVerified: boolean;
  isPro: boolean;
  ratingSum: number;
  ratingCount: number;
  qualitySum: number;
  speedSum: number;
  commitmentSum: number;
  communicationSum: number;
  bio?: string;
  lat?: number;
  lng?: number;
  acceptsUrgentRequests: boolean;
  completedJobsCount: number;
  earningsGross: number;
  earningsLabor: number;
  earningsParts: number;
  earningsPlatformFee: number;
  earningsNet: number;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const profiles = () => col(Collections.technicianProfiles);
const users = () => col(Collections.users);

export const technicianRepository = {
  async createProfile(userId: string, input: { specialty?: string; serviceAreas: string[] }) {
    const now = new Date();
    const doc: TechnicianProfileDoc = {
      specialty: input.specialty,
      yearsExperience: 0,
      serviceAreas: input.serviceAreas,
      availability: "available",
      verificationStatus: "pending",
      isVerified: false,
      isPro: false,
      ratingSum: 0,
      ratingCount: 0,
      qualitySum: 0,
      speedSum: 0,
      commitmentSum: 0,
      communicationSum: 0,
      acceptsUrgentRequests: false,
      completedJobsCount: 0,
      earningsGross: 0,
      earningsLabor: 0,
      earningsParts: 0,
      earningsPlatformFee: 0,
      earningsNet: 0,
      createdAt: now,
      updatedAt: now
    };
    await profiles().doc(userId).set(doc);
    await col(Collections.subscriptions).doc(userId).set({ plan: "free", status: "active", createdAt: now, updatedAt: now });
  },
  async findProfile(userId: string) {
    const [profileSnap, userSnap] = await Promise.all([profiles().doc(userId).get(), users().doc(userId).get()]);
    if (!profileSnap.exists) return null;
    const user = userSnap.data() as { name?: string; phone?: string } | undefined;
    return { ...withId(profileSnap as FirebaseFirestore.DocumentSnapshot<TechnicianProfileDoc>), userId, user: { id: userId, name: user?.name, phone: user?.phone } };
  },
  updateProfile: (userId: string, data: Partial<TechnicianProfileDoc>) => profiles().doc(userId).update({ ...data, updatedAt: new Date() }),
  /** Broad fetch + in-memory filter: hackathon-scale dataset, avoids requiring a Firestore composite index. */
  async list() {
    const [snap, userSnap] = await Promise.all([profiles().where("isVerified", "==", true).get(), users().get()]);
    const names = new Map(userSnap.docs.map((d) => [d.id, (d.data() as { name?: string }).name]));
    return snap.docs.map((d) => {
      const data = withId(d as FirebaseFirestore.DocumentSnapshot<TechnicianProfileDoc>);
      return { ...data, userId: d.id, user: { id: d.id, name: names.get(d.id) } };
    });
  },
  onCompletedJob: (userId: string, financial: { labor: number; parts: number; subtotal: number; platformFee: number; technicianEarning: number }) =>
    profiles().doc(userId).update({
      completedJobsCount: FieldValue.increment(1),
      earningsGross: FieldValue.increment(financial.subtotal),
      earningsLabor: FieldValue.increment(financial.labor),
      earningsParts: FieldValue.increment(financial.parts),
      earningsPlatformFee: FieldValue.increment(financial.platformFee),
      earningsNet: FieldValue.increment(financial.technicianEarning)
    }),
  onReview: (userId: string, review: { overall: number; quality: number; speed: number; commitment: number; communication: number }) =>
    profiles().doc(userId).update({
      ratingSum: FieldValue.increment(review.overall),
      ratingCount: FieldValue.increment(1),
      qualitySum: FieldValue.increment(review.quality),
      speedSum: FieldValue.increment(review.speed),
      commitmentSum: FieldValue.increment(review.commitment),
      communicationSum: FieldValue.increment(review.communication)
    }),
  reviews: async (technicianId: string) => {
    const snap = await col(Collections.reviews).where("technicianId", "==", technicianId).get();
    return snap.docs.map((d) => withId(d)).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  },
  verificationQueue: async (status: "pending" | "approved" | "rejected") => {
    const [snap, userSnap] = await Promise.all([profiles().where("verificationStatus", "==", status).get(), users().get()]);
    const byId = new Map(userSnap.docs.map((d) => [d.id, d.data() as { name?: string; email?: string; phone?: string }]));
    return snap.docs
      .map((d) => ({ ...withId(d as FirebaseFirestore.DocumentSnapshot<TechnicianProfileDoc>), userId: d.id, user: { id: d.id, ...byId.get(d.id) } }))
      .sort((a, b) => tsMillis(a.createdAt) - tsMillis(b.createdAt));
  },
  count: async () => (await profiles().count().get()).data().count
};
