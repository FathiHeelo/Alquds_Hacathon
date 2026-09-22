import { randomBytes } from "node:crypto";

import { Collections, FieldValue, col, firestore } from "../../database/firestore";
import { tsMillis, withId } from "../../shared/firestore.helpers";

interface PartnerRewardDoc {
  partnerId: string;
  title: string;
  pointsCost: number;
  active: boolean;
}

const rewardTx = () => col(Collections.rewardTransactions);
const partnerRewards = () => col(Collections.partnerRewards);
const redemptions = () => col(Collections.redemptions);
const users = () => col(Collections.users);

export const rewardRepository = {
  transactions: async (userId: string) => {
    const snap = await rewardTx().where("userId", "==", userId).get();
    return snap.docs.map(withId).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
  },
  activeRewards: async () => {
    const snap = await partnerRewards().where("active", "==", true).get();
    const rows = snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<PartnerRewardDoc>));
    const partnerIds = [...new Set(rows.map((r) => r.partnerId))];
    const partnerSnaps = partnerIds.length ? await firestore.getAll(...partnerIds.map((id) => col(Collections.partners).doc(id))) : [];
    const partners = new Map(partnerSnaps.map((s) => [s.id, s.data() as { name: string } | undefined]));
    return rows.map((r) => ({ ...r, partner: partners.get(r.partnerId) })).sort((a, b) => a.pointsCost - b.pointsCost);
  },
  findReward: async (id: string) => {
    const snap = await partnerRewards().doc(id).get();
    if (!snap.exists) return null;
    const data = withId(snap as FirebaseFirestore.DocumentSnapshot<PartnerRewardDoc>);
    const partnerSnap = await col(Collections.partners).doc(data.partnerId).get();
    return { ...data, partner: partnerSnap.data() as { name: string } | undefined };
  },
  redemptions: async (userId: string) => {
    const snap = await redemptions().where("userId", "==", userId).get();
    const rows = snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<{ rewardId: string; points: number; code: string; createdAt: FirebaseFirestore.Timestamp | Date }>));
    const rewardIds = [...new Set(rows.map((r) => r.rewardId))];
    const rewardSnaps = rewardIds.length ? await firestore.getAll(...rewardIds.map((id) => partnerRewards().doc(id))) : [];
    const rewards = new Map(rewardSnaps.map((s) => [s.id, s.data() as { title: string; partnerId: string } | undefined]));
    return rows.sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt)).map((r) => ({ ...r, reward: rewards.get(r.rewardId) }));
  },
  /** Idempotent earn: `create()` fails (ALREADY_EXISTS) if this (user, reason, ref) was already awarded. */
  async awardIfNew(userId: string, points: number, reason: string, refId: string) {
    const ref = rewardTx().doc(`${userId}__${reason}__${refId}`);
    try {
      await ref.create({ userId, type: "earn", points, reason, refId, createdAt: new Date() });
    } catch {
      return false;
    }
    await users().doc(userId).update({ pointsEarned: FieldValue.increment(points) });
    return true;
  },
  /** Balance check + ledger write happen in one transaction, so points can never go negative. */
  async redeem(userId: string, reward: { id: string; pointsCost: number }) {
    return firestore.runTransaction(async (tx) => {
      const userRef = users().doc(userId);
      const userSnap = await tx.get(userRef);
      const user = userSnap.data() as { pointsEarned?: number; pointsRedeemed?: number } | undefined;
      const balance = (user?.pointsEarned ?? 0) - (user?.pointsRedeemed ?? 0);
      if (balance < reward.pointsCost) return { ok: false as const, balance };

      const redemptionRef = redemptions().doc();
      const code = `AMR-${randomBytes(4).toString("hex").toUpperCase()}`;
      tx.create(redemptionRef, { userId, rewardId: reward.id, points: reward.pointsCost, code, createdAt: new Date() });
      tx.create(rewardTx().doc(), { userId, type: "redeem", points: reward.pointsCost, reason: "redemption", refId: redemptionRef.id, createdAt: new Date() });
      tx.update(userRef, { pointsRedeemed: (user?.pointsRedeemed ?? 0) + reward.pointsCost });
      return { ok: true as const, redemption: { id: redemptionRef.id, code }, balance: balance - reward.pointsCost };
    });
  }
};
