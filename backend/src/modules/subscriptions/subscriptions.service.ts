import { proPlanDays } from "../../config/business";
import { Collections, col } from "../../database/firestore";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";

interface SubscriptionDoc {
  plan: "free" | "pro";
  status: "active" | "expired" | "cancelled";
  activeFrom?: FirebaseFirestore.Timestamp | Date | null;
  activeUntil?: FirebaseFirestore.Timestamp | Date | null;
}

const subscriptions = () => col(Collections.subscriptions);
const technicianProfiles = () => col(Collections.technicianProfiles);

/** Effective Pro state: plan is pro, status active, and not past activeUntil. */
const isProActive = (sub: SubscriptionDoc | undefined, now = new Date()) => {
  if (!sub || sub.plan !== "pro" || sub.status !== "active") return false;
  const until = sub.activeUntil instanceof Date ? sub.activeUntil : sub.activeUntil?.toDate();
  return !until || until > now;
};

const present = (sub: SubscriptionDoc | undefined) => {
  const pro = isProActive(sub);
  return {
    plan: pro ? "pro" : "free",
    status: pro ? "active" : (sub?.status ?? "active"),
    activeFrom: sub?.activeFrom ?? null,
    activeUntil: sub?.activeUntil ?? null,
    isPro: pro,
    capabilities: { offerAssistant: pro }
  };
};

export const subscriptionService = {
  async getEntitlement(technicianId: string) {
    const snap = await subscriptions().doc(technicianId).get();
    return present(snap.data() as SubscriptionDoc | undefined);
  },

  /** Central capability check for the AI Offer Assistant. */
  async canUseOfferAssistant(technicianId: string) {
    const snap = await subscriptions().doc(technicianId).get();
    return isProActive(snap.data() as SubscriptionDoc | undefined);
  },

  async assertOfferAssistantAccess(technicianId: string) {
    if (!(await this.canUseOfferAssistant(technicianId))) {
      throw new AppError(ErrorCode.ProRequired, "AI Offer Assistant requires a Pro subscription", 403);
    }
  },

  /** Admin/demo activation. No payment processing. */
  async setPlan(technicianId: string, plan: "free" | "pro", days = proPlanDays) {
    if (!(await technicianProfiles().doc(technicianId).get()).exists) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);

    const now = new Date();
    const data =
      plan === "pro"
        ? { plan, status: "active" as const, activeFrom: now, activeUntil: new Date(now.getTime() + days * 86_400_000) }
        : { plan, status: "cancelled" as const, activeUntil: now };

    await Promise.all([
      subscriptions().doc(technicianId).set({ ...data, updatedAt: now }, { merge: true }),
      technicianProfiles().doc(technicianId).update({ isPro: plan === "pro" })
    ]);
    return this.getEntitlement(technicianId);
  }
};
