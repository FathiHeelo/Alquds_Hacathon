import { proPlanDays } from "../../config/business";
import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";

type Sub = { plan: "free" | "pro"; status: "active" | "expired" | "cancelled"; activeFrom: Date | null; activeUntil: Date | null } | null;

/** Effective Pro state: plan is pro, status active, and not past activeUntil. */
const isProActive = (sub: Sub, now = new Date()) =>
  !!sub && sub.plan === "pro" && sub.status === "active" && (!sub.activeUntil || sub.activeUntil > now);

const present = (sub: Sub) => {
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
    return present(await prisma.subscription.findUnique({ where: { technicianId } }));
  },

  /** Central capability check for the AI Offer Assistant. */
  async canUseOfferAssistant(technicianId: string) {
    return isProActive(await prisma.subscription.findUnique({ where: { technicianId } }));
  },

  async assertOfferAssistantAccess(technicianId: string) {
    if (!(await this.canUseOfferAssistant(technicianId))) {
      throw new AppError(ErrorCode.ProRequired, "AI Offer Assistant requires a Pro subscription", 403);
    }
  },

  /** Admin/demo activation. No payment processing. */
  async setPlan(technicianId: string, plan: "free" | "pro", days = proPlanDays) {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId: technicianId } });
    if (!profile) throw new AppError(ErrorCode.NotFound, "Technician not found", 404);

    const now = new Date();
    const data =
      plan === "pro"
        ? { plan, status: "active" as const, activeFrom: now, activeUntil: new Date(now.getTime() + days * 86_400_000) }
        : { plan, status: "cancelled" as const, activeUntil: now };

    await prisma.$transaction([
      prisma.subscription.upsert({ where: { technicianId }, update: data, create: { technicianId, ...data } }),
      prisma.technicianProfile.update({ where: { userId: technicianId }, data: { isPro: plan === "pro" } })
    ]);
    return this.getEntitlement(technicianId);
  }
};
