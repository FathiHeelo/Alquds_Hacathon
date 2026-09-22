import { Collections, FieldValue, col, firestore } from "../../database/firestore";
import { withId } from "../../shared/firestore.helpers";

export interface UserDoc {
  role: "customer" | "technician" | "admin";
  name: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  status: "active" | "suspended" | "frozen";
  pointsEarned: number;
  pointsRedeemed: number;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
}

const users = () => col(Collections.users);
const emailIndex = () => col(Collections.userEmailIndex);
const phoneIndex = () => col(Collections.userPhoneIndex);

export const userRepository = {
  findById: async (id: string) => {
    const snap = await users().doc(id).get();
    return snap.exists ? withId(snap as FirebaseFirestore.DocumentSnapshot<UserDoc>) : null;
  },
  findByEmail: async (email: string) => {
    const indexSnap = await emailIndex().doc(email).get();
    if (!indexSnap.exists) return null;
    return userRepository.findById((indexSnap.data() as { userId: string }).userId);
  },
  findByPhone: async (phone: string) => {
    const indexSnap = await phoneIndex().doc(phone).get();
    if (!indexSnap.exists) return null;
    return userRepository.findById((indexSnap.data() as { userId: string }).userId);
  },
  /**
   * Creates the user plus its email/phone uniqueness-index documents atomically: `tx.create()`
   * fails if an index doc already exists, so two concurrent registrations for the same email can
   * never both succeed (Firestore has no native unique column, so this replaces the MySQL unique index).
   */
  async create(id: string, data: Omit<UserDoc, "createdAt" | "updatedAt">) {
    const now = new Date();
    const full: UserDoc = { ...data, createdAt: now, updatedAt: now };
    await firestore.runTransaction(async (tx) => {
      tx.create(users().doc(id), full);
      if (data.email) tx.create(emailIndex().doc(data.email), { userId: id });
      if (data.phone) tx.create(phoneIndex().doc(data.phone), { userId: id });
    });
    return { id, ...full };
  },
  async update(id: string, data: Partial<Pick<UserDoc, "name" | "phone" | "status">>) {
    const ref = users().doc(id);
    if (data.phone !== undefined) {
      // Re-point the phone index atomically with the profile update; old index entry is dropped.
      await firestore.runTransaction(async (tx) => {
        const current = await tx.get(ref);
        const currentPhone = (current.data() as UserDoc | undefined)?.phone;
        tx.create(phoneIndex().doc(data.phone!), { userId: id });
        if (currentPhone && currentPhone !== data.phone) tx.delete(phoneIndex().doc(currentPhone));
        tx.update(ref, { ...data, updatedAt: new Date() });
      });
    } else {
      await ref.update({ ...data, updatedAt: new Date() });
    }
    return userRepository.findById(id);
  },
  awardPoints: (id: string, points: number) => users().doc(id).update({ pointsEarned: FieldValue.increment(points) }),
  redeemPoints: (id: string, points: number) => users().doc(id).update({ pointsRedeemed: FieldValue.increment(points) }),
  setStatus: (id: string, status: UserDoc["status"]) => users().doc(id).update({ status, updatedAt: new Date() }),
  count: async () => (await users().count().get()).data().count
};

export const publicUser = <T extends { passwordHash?: string }>(user: T): Omit<T, "passwordHash"> => {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
};

/** Ledger balance = pointsEarned - pointsRedeemed, both maintained via atomic increments. */
export const withBalance = <T extends { pointsEarned: number; pointsRedeemed: number }>(user: T) => ({
  ...user,
  pointsBalance: user.pointsEarned - user.pointsRedeemed
});
