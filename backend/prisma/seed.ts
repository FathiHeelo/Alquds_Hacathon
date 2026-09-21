import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Demo password for every seeded account. */
export const DEMO_PASSWORD = "Demo1234!";

const categories = [
  { id: "plumbing", nameEn: "Plumbing", nameAr: "سباكة" },
  { id: "electrical", nameEn: "Electrical", nameAr: "كهرباء" },
  { id: "carpentry", nameEn: "Carpentry", nameAr: "نجارة" },
  { id: "painting", nameEn: "Painting", nameAr: "دهان" },
  { id: "hvac", nameEn: "AC & Heating", nameAr: "تكييف وتدفئة" },
  { id: "appliances", nameEn: "Appliances", nameAr: "أجهزة منزلية" }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

  for (const c of categories) await prisma.serviceCategory.upsert({ where: { id: c.id }, update: c, create: c });

  // ── Users ──
  const users = [
    { id: "demo-customer", role: "customer" as const, name: "Demo Customer", email: "customer@ammerha.demo", phone: "0590000001" },
    { id: "demo-technician", role: "technician" as const, name: "Demo Technician", email: "technician@ammerha.demo", phone: "0590000002" },
    { id: "demo-technician-2", role: "technician" as const, name: "Pending Technician", email: "technician2@ammerha.demo", phone: "0590000003" },
    { id: "demo-admin", role: "admin" as const, name: "Demo Admin", email: "admin@ammerha.demo", phone: "0590000004" }
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, update: { ...u, passwordHash }, create: { ...u, passwordHash } });
  }

  // ── Technician profiles + entitlements ──
  await prisma.technicianProfile.upsert({
    where: { userId: "demo-technician" },
    update: { lat: 31.7807, lng: 35.2326, acceptsUrgentRequests: true },
    create: {
      userId: "demo-technician",
      specialty: "plumbing",
      yearsExperience: 8,
      serviceAreas: ["old_city", "sheikh_jarrah"],
      availability: "available",
      verificationStatus: "approved",
      isVerified: true,
      isPro: true,
      ratingAvg: 5,
      ratingCount: 1,
      bio: "Plumber specialised in old-city stone houses.",
      lat: 31.7807,
      lng: 35.2326,
      acceptsUrgentRequests: true
    }
  });
  await prisma.technicianProfile.upsert({
    where: { userId: "demo-technician-2" },
    update: { verificationStatus: "pending", isVerified: false },
    create: { userId: "demo-technician-2", specialty: "electrical", yearsExperience: 3, serviceAreas: ["old_city"], verificationStatus: "pending" }
  });
  await prisma.subscription.upsert({
    where: { technicianId: "demo-technician" },
    update: { plan: "pro", status: "active", activeFrom: new Date(), activeUntil: daysFromNow(365) },
    create: { technicianId: "demo-technician", plan: "pro", status: "active", activeFrom: new Date(), activeUntil: daysFromNow(365) }
  });
  await prisma.subscription.upsert({ where: { technicianId: "demo-technician-2" }, update: {}, create: { technicianId: "demo-technician-2", plan: "free" } });

  // ── Primary demo request: old-city plumbing leak (open, no offers yet, so the flow can be demoed) ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-old-city-plumbing" },
    update: {},
    create: {
      id: "demo-request-old-city-plumbing",
      customerId: "demo-customer",
      categoryId: "plumbing",
      description: "There is water leaking under the kitchen sink in the Old City.",
      locationSummary: "Old City, Jerusalem",
      area: "old_city",
      urgency: "high",
      status: "open",
      aiSummary: { likelyIssue: "Leaking sink trap or supply hose", confidence: 0.8, urgency: "high" },
      media: { create: [{ url: "https://example.com/demo/leak.jpg", type: "image" }] }
    }
  });

  // ── Historical completed job (gives reputation, earnings and points real backing data) ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-past" },
    update: {},
    create: { id: "demo-request-past", customerId: "demo-customer", categoryId: "plumbing", description: "Replace bathroom tap", area: "old_city", status: "completed" }
  });
  await prisma.offer.upsert({
    where: { id: "demo-offer-past" },
    update: {},
    create: { id: "demo-offer-past", requestId: "demo-request-past", technicianId: "demo-technician", price: 80, etaMinutes: 60, status: "accepted" }
  });
  await prisma.job.upsert({
    where: { id: "demo-job-past" },
    update: {},
    create: {
      id: "demo-job-past",
      requestId: "demo-request-past",
      offerId: "demo-offer-past",
      customerId: "demo-customer",
      technicianId: "demo-technician",
      status: "completed",
      completedAt: daysFromNow(-7)
    }
  });
  await prisma.jobFinancial.upsert({
    where: { jobId: "demo-job-past" },
    update: {},
    create: { jobId: "demo-job-past", labor: 80, parts: 20, subtotal: 100, commissionRate: 0.1, platformFee: 10, total: 110, technicianEarning: 100 }
  });
  await prisma.review.upsert({
    where: { jobId: "demo-job-past" },
    update: {},
    create: {
      jobId: "demo-job-past",
      customerId: "demo-customer",
      technicianId: "demo-technician",
      overall: 5,
      quality: 5,
      speed: 4,
      commitment: 5,
      communication: 5,
      comment: "Fast and clean work."
    }
  });
  await prisma.rewardTransaction.upsert({
    where: { userId_reason_refId: { userId: "demo-customer", reason: "job_rated", refId: "demo-job-past" } },
    update: {},
    create: { userId: "demo-customer", type: "earn", points: 50, reason: "job_rated", refId: "demo-job-past" }
  });
  await prisma.rewardTransaction.upsert({
    where: { userId_reason_refId: { userId: "demo-technician", reason: "job_completed", refId: "demo-job-past" } },
    update: {},
    create: { userId: "demo-technician", type: "earn", points: 30, reason: "job_completed", refId: "demo-job-past" }
  });

  // ── Partners & rewards ──
  await prisma.partner.upsert({ where: { id: "demo-partner-hardware" }, update: {}, create: { id: "demo-partner-hardware", name: "Old City Hardware", area: "old_city" } });
  await prisma.partner.upsert({ where: { id: "demo-partner-cafe" }, update: {}, create: { id: "demo-partner-cafe", name: "Jaffa Gate Café", area: "old_city" } });
  const rewards = [
    { id: "demo-reward-hardware", partnerId: "demo-partner-hardware", title: "10% off tools & fittings", pointsCost: 40 },
    { id: "demo-reward-cafe", partnerId: "demo-partner-cafe", title: "Free coffee", pointsCost: 20 },
    { id: "demo-reward-big", partnerId: "demo-partner-hardware", title: "50 NIS store voucher", pointsCost: 500 }
  ];
  for (const r of rewards) await prisma.partnerReward.upsert({ where: { id: r.id }, update: r, create: r });

  // ── Deterministic admin cases ──
  await prisma.report.upsert({
    where: { id: "demo-report-1" },
    update: {},
    create: { id: "demo-report-1", reporterId: "demo-customer", targetUserId: "demo-technician-2", reason: "Asked to pay outside the app", status: "open" }
  });
  await prisma.riskAssessment.upsert({
    where: { id: "demo-risk-1" },
    update: {},
    create: {
      id: "demo-risk-1",
      userId: "demo-technician-2",
      level: "medium",
      score: 0.55,
      source: "jabr-sim",
      status: "open",
      flags: { create: [{ code: "off_platform_payment", note: "Mentioned cash outside the app" }] }
    }
  });

  console.log(`Seeded demo data (password for all demo accounts: ${DEMO_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
