/**
 * Firestore demo/seed data — the Jerusalem showcase dataset, ported 1:1 from the old MySQL seed so
 * the frontend demo and the test suite keep working against the same ids/emails.
 *
 * Run with `npm run seed` (needs FIREBASE_SERVICE_ACCOUNT_PATH to resolve, see .env.example).
 * Safe to re-run: every write is a `set()` (upsert), so re-seeding just refreshes the same records.
 */
import bcrypt from "bcryptjs";

import { Collections, col, firestore } from "../database/firestore";

export const DEMO_PASSWORD = "Demo1234!";

const categories = [
  { id: "plumbing", nameEn: "Plumbing", nameAr: "سباكة" },
  { id: "electrical", nameEn: "Electrical", nameAr: "كهرباء" },
  { id: "carpentry", nameEn: "Carpentry", nameAr: "نجارة" },
  { id: "painting", nameEn: "Painting", nameAr: "دهان" },
  { id: "hvac", nameEn: "AC & Heating", nameAr: "تكييف وتدفئة" },
  { id: "appliances", nameEn: "Appliances", nameAr: "أجهزة منزلية" },
  { id: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات" },
  { id: "general", nameEn: "General maintenance", nameAr: "صيانة عامة" }
];

const users = [
  { id: "demo-customer", role: "customer" as const, name: "أحمد المقدسي", email: "customer@ammerha.demo", phone: "0590000001" },
  { id: "demo-technician", role: "technician" as const, name: "طارق المقدسي", email: "technician@ammerha.demo", phone: "0590000002" },
  { id: "demo-technician-2", role: "technician" as const, name: "رنا الحسيني", email: "technician2@ammerha.demo", phone: "0590000003" },
  { id: "demo-admin", role: "admin" as const, name: "نور الخطيب", email: "admin@ammerha.demo", phone: "0590000004" },
  { id: "tech-user-01", role: "technician" as const, name: "محمود الخطيب", email: "mahmoud@ammerha.demo", phone: "0591000001" },
  { id: "tech-user-02", role: "technician" as const, name: "سامر ناصر", email: "samer@ammerha.demo", phone: "0591000002" },
  { id: "tech-user-03", role: "technician" as const, name: "أحمد عوض", email: "ahmad@ammerha.demo", phone: "0591000003" },
  { id: "tech-user-04", role: "technician" as const, name: "يوسف الدجاني", email: "yousef@ammerha.demo", phone: "0591000004" },
  { id: "tech-user-05", role: "technician" as const, name: "خالد سليم", email: "khaled@ammerha.demo", phone: "0591000005" },
  { id: "tech-user-06", role: "technician" as const, name: "عمر حجازي", email: "omar@ammerha.demo", phone: "0591000006" },
  { id: "tech-user-07", role: "technician" as const, name: "رائد منصور", email: "raed@ammerha.demo", phone: "0591000007" },
  { id: "tech-user-08", role: "technician" as const, name: "أنس بركات", email: "anas@ammerha.demo", phone: "0591000008" },
  { id: "customer-01", role: "customer" as const, name: "ليان ناصر", email: "ahmad.customer@ammerha.demo", phone: "0592000001" },
  { id: "customer-02", role: "customer" as const, name: "محمد حمدان", email: "mohammad.customer@ammerha.demo", phone: "0592000002" },
  { id: "customer-03", role: "customer" as const, name: "مريم الكرمي", email: "layan.customer@ammerha.demo", phone: "0592000003" }
];

const technicians = [
  { userId: "tech-user-01", specialty: "plumbing", yearsExperience: 11, areas: ["سلوان", "البلدة القديمة"], lat: 31.7766, lng: 35.2354, isPro: false, rating: 4.8, count: 87, bio: "صيانة تمديدات المياه والسخانات وكشف التسريب." },
  { userId: "tech-user-02", specialty: "electrical", yearsExperience: 9, areas: ["وادي الجوز", "الطور"], lat: 31.7901, lng: 35.2411, isPro: true, rating: 4.9, count: 112, bio: "كهرباء منزلية ولوحات وقواطع مع فحص السلامة." },
  { userId: "tech-user-03", specialty: "hvac", yearsExperience: 7, areas: ["الشيخ جراح", "شعفاط"], lat: 31.7992, lng: 35.229, isPro: true, rating: 4.7, count: 64, bio: "تركيب وصيانة المكيفات والتبريد المنزلي." },
  { userId: "tech-user-04", specialty: "appliances", yearsExperience: 6, areas: ["بيت حنينا", "شعفاط"], lat: 31.8152, lng: 35.226, isPro: false, rating: 4.6, count: 51, bio: "صيانة الغسالات والثلاجات والأجهزة المنزلية." },
  { userId: "tech-user-05", specialty: "carpentry", yearsExperience: 13, areas: ["القدس", "بيت صفافا"], lat: 31.7688, lng: 35.2162, isPro: false, rating: 4.8, count: 93, bio: "أبواب وخزائن وأعمال نجارة حسب الطلب." },
  { userId: "tech-user-06", specialty: "electronics", yearsExperience: 5, areas: ["المصرارة", "باب الساهرة"], lat: 31.7865, lng: 35.2317, isPro: false, rating: 4.5, count: 39, bio: "صيانة شاشات وأجهزة إلكترونية منزلية." },
  { userId: "tech-user-07", specialty: "plumbing", yearsExperience: 10, areas: ["رأس العامود", "سلوان"], lat: 31.7747, lng: 35.2419, isPro: true, rating: 4.9, count: 126, bio: "سباكة طوارئ وصيانة خزانات وتمديدات." },
  { userId: "tech-user-08", specialty: "general", yearsExperience: 8, areas: ["القدس", "الشيخ جراح"], lat: 31.7952, lng: 35.2248, isPro: false, rating: 4.7, count: 72, bio: "صيانة منزلية عامة وتركيب وتجهيزات." }
] as const;

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);
const ratingCounters = (rating: number, count: number) => {
  const sum = Math.round(rating * count);
  return { ratingSum: sum, ratingCount: count, qualitySum: sum, speedSum: sum, commitmentSum: sum, communicationSum: sum };
};

export async function seedDemoData() {
  const batch = firestore.batch();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();

  // ── Categories ──
  for (const c of categories) batch.set(col(Collections.serviceCategories).doc(c.id), c);

  // ── Users + auth uniqueness indexes ──
  const pointsByUser: Record<string, number> = { "demo-customer": 850, "demo-technician": 30 };
  for (const u of users) {
    batch.set(col(Collections.users).doc(u.id), { ...u, passwordHash, status: "active", pointsEarned: pointsByUser[u.id] ?? 0, pointsRedeemed: 0, createdAt: now, updatedAt: now });
    batch.set(col(Collections.userEmailIndex).doc(u.email), { userId: u.id });
    batch.set(col(Collections.userPhoneIndex).doc(u.phone), { userId: u.id });
  }

  // ── Technician profiles + entitlements ──
  const demoTechnicianRating = ratingCounters(4.9, 154);
  batch.set(col(Collections.technicianProfiles).doc("demo-technician"), {
    specialty: "plumbing", yearsExperience: 8, serviceAreas: ["البلدة القديمة", "الشيخ جراح"], availability: "available",
    verificationStatus: "approved", isVerified: true, isPro: true, ...demoTechnicianRating,
    bio: "فني سباكة وصحية متخصص في بيوت القدس القديمة.", lat: 31.7807, lng: 35.2326, acceptsUrgentRequests: true,
    completedJobsCount: 1, earningsGross: 100, earningsLabor: 80, earningsParts: 20, earningsPlatformFee: 10, earningsNet: 100,
    createdAt: now, updatedAt: now
  });
  batch.set(col(Collections.subscriptions).doc("demo-technician"), { plan: "pro", status: "active", activeFrom: now, activeUntil: daysFromNow(365), createdAt: now, updatedAt: now });

  batch.set(col(Collections.technicianProfiles).doc("demo-technician-2"), {
    specialty: "electrical", yearsExperience: 5, serviceAreas: ["بيت حنينا"], availability: "available",
    verificationStatus: "pending", isVerified: false, isPro: false, ratingSum: 0, ratingCount: 0, qualitySum: 0, speedSum: 0, commitmentSum: 0, communicationSum: 0,
    bio: "فنية كهرباء منزلية بانتظار استكمال التوثيق.", lat: 31.8286, lng: 35.2234, acceptsUrgentRequests: false,
    completedJobsCount: 0, earningsGross: 0, earningsLabor: 0, earningsParts: 0, earningsPlatformFee: 0, earningsNet: 0,
    createdAt: now, updatedAt: now
  });
  batch.set(col(Collections.subscriptions).doc("demo-technician-2"), { plan: "free", status: "active", createdAt: now, updatedAt: now });

  for (const t of technicians) {
    batch.set(col(Collections.technicianProfiles).doc(t.userId), {
      specialty: t.specialty, yearsExperience: t.yearsExperience, serviceAreas: [...t.areas], availability: "available",
      verificationStatus: "approved", isVerified: true, isPro: t.isPro, ...ratingCounters(t.rating, t.count),
      bio: t.bio, lat: t.lat, lng: t.lng, acceptsUrgentRequests: t.isPro,
      completedJobsCount: 1, earningsGross: 90, earningsLabor: 90, earningsParts: 0, earningsPlatformFee: 9, earningsNet: 90,
      createdAt: now, updatedAt: now
    });
    batch.set(col(Collections.subscriptions).doc(t.userId), { plan: t.isPro ? "pro" : "free", status: "active", createdAt: now, updatedAt: now });
  }

  // ── Primary Jerusalem request with a real, persisted (pending) offer ──
  const primaryRequest = {
    customerId: "demo-customer", categoryId: "plumbing", description: "يوجد تسريب مياه تحت مجلى المطبخ في البلدة القديمة.",
    locationSummary: "البلدة القديمة، القدس", area: "البلدة القديمة", lat: 31.7781, lng: 35.2354, urgency: "high" as const, status: "matched" as const,
    aiSummary: { likelyIssue: "تسريب في سيفون المجلى أو خرطوم التغذية", confidence: 0.86, urgency: "high" },
    media: [{ url: "https://example.com/demo/leak.jpg", type: "image" as const }], createdAt: now, updatedAt: now
  };
  batch.set(col(Collections.repairRequests).doc("demo-request-old-city-plumbing"), primaryRequest);
  batch.set(col(Collections.offers).doc("demo-request-old-city-plumbing__demo-technician"), {
    requestId: "demo-request-old-city-plumbing", technicianId: "demo-technician", price: 110, etaMinutes: 20,
    message: "قريب من البلدة القديمة وأستطيع فحص التسريب اليوم.", status: "pending", createdAt: now, updatedAt: now
  });

  // ── Historical completed job (backs reputation/earnings/points with real data) ──
  const pastRequest = { customerId: "demo-customer", categoryId: "plumbing", description: "استبدال خلاط الحمام القديم", locationSummary: "باب الساهرة، القدس", area: "باب الساهرة", lat: 31.7864, lng: 35.2325, urgency: "medium" as const, status: "completed" as const, media: [], createdAt: now, updatedAt: now };
  batch.set(col(Collections.repairRequests).doc("demo-request-past"), pastRequest);
  const pastFinancial = { labor: 80, parts: 20, subtotal: 100, commissionRate: 0.1, platformFee: 10, total: 110, technicianEarning: 100 };
  batch.set(col(Collections.jobs).doc("demo-job-past"), {
    requestId: "demo-request-past", offerId: "demo-job-past", customerId: "demo-customer", technicianId: "demo-technician", status: "completed",
    completedAt: daysFromNow(-7),
    request: { id: "demo-request-past", categoryId: pastRequest.categoryId, description: pastRequest.description, locationSummary: pastRequest.locationSummary, area: pastRequest.area, lat: pastRequest.lat, lng: pastRequest.lng, urgency: pastRequest.urgency, createdAt: now },
    offer: { price: 80, etaMinutes: 60, technician: { id: "demo-technician", name: "طارق المقدسي", technicianProfile: { specialty: "plumbing", isVerified: true, isPro: true, ratingAvg: 4.9, ratingCount: 154 } } },
    financial: pastFinancial, createdAt: now, updatedAt: now
  });
  batch.set(col(Collections.reviews).doc("demo-job-past"), {
    jobId: "demo-job-past", customerId: "demo-customer", technicianId: "demo-technician", overall: 5, quality: 5, speed: 4, commitment: 5, communication: 5,
    comment: "وصل في الموعد وكان العمل مرتباً ونظيفاً.", createdAt: now
  });
  batch.set(col(Collections.rewardTransactions).doc("demo-customer__job_rated__demo-job-past"), { userId: "demo-customer", type: "earn", points: 50, reason: "job_rated", refId: "demo-job-past", createdAt: now });
  batch.set(col(Collections.rewardTransactions).doc("demo-technician__job_completed__demo-job-past"), { userId: "demo-technician", type: "earn", points: 30, reason: "job_completed", refId: "demo-job-past", createdAt: now });
  batch.set(col(Collections.rewardTransactions).doc("demo-customer__welcome_demo__jerusalem-showcase"), { userId: "demo-customer", type: "earn", points: 800, reason: "welcome_demo", refId: "jerusalem-showcase", createdAt: now });

  // ── Active customer job + private conversation ──
  const activeRequest = { customerId: "demo-customer", categoryId: "electrical", description: "القاطع الرئيسي يفصل عند تشغيل الفرن والغسالة معاً.", locationSummary: "الشيخ جراح، القدس", area: "الشيخ جراح", lat: 31.7957, lng: 35.2292, urgency: "medium" as const, status: "accepted" as const, media: [], createdAt: now, updatedAt: now };
  batch.set(col(Collections.repairRequests).doc("demo-request-active-electric"), activeRequest);
  batch.set(col(Collections.offers).doc("demo-request-active-electric__demo-technician"), {
    requestId: "demo-request-active-electric", technicianId: "demo-technician", price: 145, etaMinutes: 15,
    message: "أستطيع فحص اللوحة والقاطع اليوم مع ضمان على الإصلاح.", status: "accepted", createdAt: now, updatedAt: now
  });
  batch.set(col(Collections.jobs).doc("demo-request-active-electric__demo-technician"), {
    requestId: "demo-request-active-electric", offerId: "demo-request-active-electric__demo-technician", customerId: "demo-customer", technicianId: "demo-technician", status: "on_the_way",
    scheduledAt: now,
    request: { id: "demo-request-active-electric", categoryId: activeRequest.categoryId, description: activeRequest.description, locationSummary: activeRequest.locationSummary, area: activeRequest.area, lat: activeRequest.lat, lng: activeRequest.lng, urgency: activeRequest.urgency, createdAt: now },
    offer: { price: 145, etaMinutes: 15, technician: { id: "demo-technician", name: "طارق المقدسي", technicianProfile: { specialty: "plumbing", isVerified: true, isPro: true, ratingAvg: 4.9, ratingCount: 154 } } },
    createdAt: now, updatedAt: now
  });
  const activeJobId = "demo-request-active-electric__demo-technician";
  batch.set(col(Collections.conversations).doc(activeJobId), { jobId: activeJobId, customerId: "demo-customer", technicianId: "demo-technician", createdAt: now });
  const conversationMessages = [
    { id: "demo-message-active-1", senderId: "demo-technician", body: "أهلاً أحمد، راجعت وصف المشكلة وأنا في الطريق إلى الشيخ جراح." },
    { id: "demo-message-active-2", senderId: "demo-customer", body: "تمام، بانتظارك. الموقع موضح داخل الطلب." },
    { id: "demo-message-active-3", senderId: "demo-technician", body: "باقي تقريباً 10 دقائق للوصول." }
  ];
  for (const message of conversationMessages) {
    batch.set(col(Collections.conversations).doc(activeJobId).collection("messages").doc(message.id), { senderId: message.senderId, type: "text", body: message.body, createdAt: now });
  }

  // ── Customer request with two comparable (pending) offers ──
  const offersRequest = { customerId: "demo-customer", categoryId: "plumbing", description: "سخان المياه لا يسخن والماء يخرج فاتراً فقط.", locationSummary: "وادي الجوز، القدس", area: "وادي الجوز", lat: 31.793, lng: 35.238, urgency: "medium" as const, status: "matched" as const, media: [], createdAt: now, updatedAt: now };
  batch.set(col(Collections.repairRequests).doc("demo-request-offers"), offersRequest);
  const showcaseOffers = [
    { technicianId: "tech-user-01", price: 120, etaMinutes: 25, message: "أفحص السخان والوصلات اليوم، والسعر النهائي يتحدد بعد الفحص." },
    { technicianId: "tech-user-07", price: 135, etaMinutes: 18, message: "متاح الآن وقريب من وادي الجوز، يشمل العرض الفحص الأولي." }
  ];
  for (const offer of showcaseOffers) {
    batch.set(col(Collections.offers).doc(`demo-request-offers__${offer.technicianId}`), { requestId: "demo-request-offers", ...offer, status: "pending", createdAt: now, updatedAt: now });
  }

  // ── Open Jerusalem requests for the technician map/feed ──
  const openRequests = [
    { id: "request-demo-01", customerId: "customer-01", categoryId: "plumbing", description: "يوجد تسريب مياه تحت المجلى ويزداد عند فتح الحنفية.", locationSummary: "سلوان، القدس", area: "سلوان", lat: 31.7756, lng: 35.2368, urgency: "high" as const },
    { id: "request-demo-02", customerId: "customer-02", categoryId: "electrical", description: "قاطع كهرباء المطبخ يفصل عند تشغيل أكثر من جهاز.", locationSummary: "وادي الجوز، القدس", area: "وادي الجوز", lat: 31.7922, lng: 35.2386, urgency: "medium" as const },
    { id: "request-demo-03", customerId: "customer-03", categoryId: "hvac", description: "المكيف يعمل لكن الهواء الخارج غير بارد منذ يومين.", locationSummary: "الشيخ جراح، القدس", area: "الشيخ جراح", lat: 31.798, lng: 35.2295, urgency: "medium" as const },
    { id: "request-demo-04", customerId: "customer-01", categoryId: "appliances", description: "الغسالة تسرب المياه من الأسفل أثناء دورة الغسيل.", locationSummary: "بيت حنينا، القدس", area: "بيت حنينا", lat: 31.826, lng: 35.2231, urgency: "low" as const },
    { id: "request-demo-05", customerId: "customer-02", categoryId: "carpentry", description: "باب غرفة النوم يحتك بالأرض ولا يغلق بشكل طبيعي.", locationSummary: "الطور، القدس", area: "الطور", lat: 31.7869, lng: 35.245, urgency: "low" as const }
  ];
  for (const request of openRequests) {
    const { id, ...data } = request;
    batch.set(col(Collections.repairRequests).doc(id), { ...data, status: "open", media: [], createdAt: now, updatedAt: now });
  }

  // One backed review per showcase technician (documents only; profile aggregates are already seeded above).
  for (let index = 0; index < technicians.length; index += 1) {
    const technician = technicians[index]!;
    const customerId = ["customer-01", "customer-02", "customer-03"][index % 3]!;
    const requestId = `demo-history-request-${index + 1}`;
    const jobId = `demo-history-job-${index + 1}`;
    const name = users.find(({ id }) => id === technician.userId)?.name ?? "فني عَمِّرها";
    batch.set(col(Collections.repairRequests).doc(requestId), { customerId, categoryId: technician.specialty, description: `صيانة منزلية مكتملة في القدس بواسطة ${name}.`, locationSummary: technician.areas[0], area: technician.areas[0], urgency: "medium", status: "completed", media: [], createdAt: now, updatedAt: now });
    const score = Math.max(4, Math.round(technician.rating));
    batch.set(col(Collections.jobs).doc(jobId), {
      requestId, offerId: jobId, customerId, technicianId: technician.userId, status: "completed", completedAt: daysFromNow(-(index + 2)),
      request: { id: requestId, categoryId: technician.specialty, description: `صيانة منزلية مكتملة في القدس بواسطة ${name}.`, locationSummary: technician.areas[0], area: technician.areas[0], urgency: "medium", createdAt: now },
      offer: { price: 90 + index * 10, etaMinutes: 30, technician: { id: technician.userId, name, technicianProfile: { specialty: technician.specialty, isVerified: true, isPro: technician.isPro, ratingAvg: technician.rating, ratingCount: technician.count } } },
      financial: { labor: 90, parts: 0, subtotal: 90, commissionRate: 0.1, platformFee: 9, total: 99, technicianEarning: 90 },
      createdAt: now, updatedAt: now
    });
    batch.set(col(Collections.reviews).doc(jobId), { jobId, customerId, technicianId: technician.userId, overall: score, quality: score, speed: score, commitment: 5, communication: 5, comment: "فني ملتزم والعمل تم بشكل ممتاز.", createdAt: now });
  }

  // ── Notifications ──
  const notifications = [
    { type: "new_offer", title: "وصلك عرضان جديدان", body: "قارن عروض الفنيين لطلب سخان المياه في وادي الجوز.", data: { requestId: "demo-request-offers" } },
    { type: "on_the_way", title: "الفني في الطريق", body: "طارق المقدسي سيصل إلى الشيخ جراح خلال نحو 10 دقائق.", data: { jobId: activeJobId, requestId: "demo-request-active-electric" } },
    { type: "reward", title: "رصيد مكافآت جديد", body: "لديك أكثر من 800 نقطة قابلة للاستبدال لدى شركاء عَمِّرها.", data: { section: "rewards" } },
    { type: "safety", title: "تذكير بحماية حسابك", body: "أبقِ المحادثة والدفع داخل عَمِّرها لضمان حقوقك.", data: {} }
  ];
  for (const notification of notifications) batch.set(col(Collections.notifications).doc(), { ...notification, userId: "demo-customer", readAt: null, createdAt: now });

  // ── Partners & rewards ──
  batch.set(col(Collections.partners).doc("demo-partner-hardware"), { name: "عدد وأدوات باب الساهرة", area: "القدس" });
  batch.set(col(Collections.partners).doc("demo-partner-cafe"), { name: "مقهى باب الخليل", area: "البلدة القديمة" });
  const rewards = [
    { id: "demo-reward-hardware", partnerId: "demo-partner-hardware", title: "خصم 10% على العدد والوصلات", pointsCost: 40, active: true },
    { id: "demo-reward-cafe", partnerId: "demo-partner-cafe", title: "قهوة مجانية", pointsCost: 20, active: true },
    // Deliberately out of reach of the demo welcome bonus, so the "insufficient points" flow stays demonstrable.
    { id: "demo-reward-big", partnerId: "demo-partner-hardware", title: "قسيمة مشتريات بقيمة 50 ₪", pointsCost: 5000, active: true }
  ];
  for (const r of rewards) batch.set(col(Collections.partnerRewards).doc(r.id), r);

  // ── Deterministic admin cases ──
  batch.set(col(Collections.reports).doc("demo-report-1"), { reporterId: "demo-customer", targetUserId: "demo-technician-2", reason: "طلب الدفع والتواصل خارج التطبيق", status: "open", createdAt: now, updatedAt: now });
  batch.set(col(Collections.riskAssessments).doc("demo-risk-1"), {
    userId: "demo-technician-2", level: "medium", score: 0.55, source: "نظام عَمِّرها الذكي", status: "open",
    flags: [{ code: "دفع_خارج_المنصة", note: "رُصد طلب للدفع نقداً خارج التطبيق" }], createdAt: now
  });

  // ── Global stats (mirrors the per-technician earnings counters above) ──
  batch.set(col(Collections.stats).doc("global"), { completedJobsCount: 1 + technicians.length, grossTotal: 100 + technicians.length * 90, platformFeeTotal: 10 + technicians.length * 9 });

  await batch.commit();
  console.log(`Seeded demo data (password for all demo accounts: ${DEMO_PASSWORD})`);
}

// Only auto-run for `npm run seed`; tests import `seedDemoData` directly instead.
if (process.argv[1]?.replace(/\\/g, "/").endsWith("seed/seed.ts")) {
  seedDemoData().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
