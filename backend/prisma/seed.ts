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
  { id: "appliances", nameEn: "Appliances", nameAr: "أجهزة منزلية" },
  { id: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات" },
  { id: "general", nameEn: "General maintenance", nameAr: "صيانة عامة" }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

  for (const c of categories) await prisma.serviceCategory.upsert({ where: { id: c.id }, update: c, create: c });

  // ── Users ──
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
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, update: { ...u, passwordHash }, create: { ...u, passwordHash } });
  }

  // ── Technician profiles + entitlements ──
  await prisma.technicianProfile.upsert({
    where: { userId: "demo-technician" },
    update: { specialty: "plumbing", yearsExperience: 8, serviceAreas: ["البلدة القديمة", "الشيخ جراح"], availability: "available", verificationStatus: "approved", isVerified: true, isPro: true, ratingAvg: 4.9, ratingCount: 154, bio: "فني سباكة وصحية متخصص في بيوت القدس القديمة.", lat: 31.7807, lng: 35.2326, acceptsUrgentRequests: true },
    create: {
      userId: "demo-technician",
      specialty: "plumbing",
      yearsExperience: 8,
      serviceAreas: ["البلدة القديمة", "الشيخ جراح"],
      availability: "available",
      verificationStatus: "approved",
      isVerified: true,
      isPro: true,
      ratingAvg: 4.9,
      ratingCount: 154,
      bio: "فني سباكة وصحية متخصص في بيوت القدس القديمة.",
      lat: 31.7807,
      lng: 35.2326,
      acceptsUrgentRequests: true
    }
  });
  await prisma.technicianProfile.upsert({
    where: { userId: "demo-technician-2" },
    update: { specialty: "electrical", yearsExperience: 5, serviceAreas: ["بيت حنينا"], verificationStatus: "pending", isVerified: false, bio: "فنية كهرباء منزلية بانتظار استكمال التوثيق.", lat: 31.8286, lng: 35.2234 },
    create: { userId: "demo-technician-2", specialty: "electrical", yearsExperience: 5, serviceAreas: ["بيت حنينا"], verificationStatus: "pending", bio: "فنية كهرباء منزلية بانتظار استكمال التوثيق.", lat: 31.8286, lng: 35.2234 }
  });

  const technicians = [
    { userId: "tech-user-01", specialty: "plumbing", yearsExperience: 11, areas: ["سلوان", "البلدة القديمة"], lat: 31.7766, lng: 35.2354, isPro: false, rating: 4.8, count: 87, bio: "صيانة تمديدات المياه والسخانات وكشف التسريب." },
    { userId: "tech-user-02", specialty: "electrical", yearsExperience: 9, areas: ["وادي الجوز", "الطور"], lat: 31.7901, lng: 35.2411, isPro: true, rating: 4.9, count: 112, bio: "كهرباء منزلية ولوحات وقواطع مع فحص السلامة." },
    { userId: "tech-user-03", specialty: "hvac", yearsExperience: 7, areas: ["الشيخ جراح", "شعفاط"], lat: 31.7992, lng: 35.2290, isPro: true, rating: 4.7, count: 64, bio: "تركيب وصيانة المكيفات والتبريد المنزلي." },
    { userId: "tech-user-04", specialty: "appliances", yearsExperience: 6, areas: ["بيت حنينا", "شعفاط"], lat: 31.8152, lng: 35.2260, isPro: false, rating: 4.6, count: 51, bio: "صيانة الغسالات والثلاجات والأجهزة المنزلية." },
    { userId: "tech-user-05", specialty: "carpentry", yearsExperience: 13, areas: ["القدس", "بيت صفافا"], lat: 31.7688, lng: 35.2162, isPro: false, rating: 4.8, count: 93, bio: "أبواب وخزائن وأعمال نجارة حسب الطلب." },
    { userId: "tech-user-06", specialty: "electronics", yearsExperience: 5, areas: ["المصرارة", "باب الساهرة"], lat: 31.7865, lng: 35.2317, isPro: false, rating: 4.5, count: 39, bio: "صيانة شاشات وأجهزة إلكترونية منزلية." },
    { userId: "tech-user-07", specialty: "plumbing", yearsExperience: 10, areas: ["رأس العامود", "سلوان"], lat: 31.7747, lng: 35.2419, isPro: true, rating: 4.9, count: 126, bio: "سباكة طوارئ وصيانة خزانات وتمديدات." },
    { userId: "tech-user-08", specialty: "general", yearsExperience: 8, areas: ["القدس", "الشيخ جراح"], lat: 31.7952, lng: 35.2248, isPro: false, rating: 4.7, count: 72, bio: "صيانة منزلية عامة وتركيب وتجهيزات." }
  ] as const;
  for (const technician of technicians) {
    const data = { specialty: technician.specialty, yearsExperience: technician.yearsExperience, serviceAreas: [...technician.areas], availability: "available" as const, verificationStatus: "approved" as const, isVerified: true, isPro: technician.isPro, ratingAvg: technician.rating, ratingCount: technician.count, bio: technician.bio, lat: technician.lat, lng: technician.lng, acceptsUrgentRequests: technician.isPro };
    await prisma.technicianProfile.upsert({ where: { userId: technician.userId }, update: data, create: { userId: technician.userId, ...data } });
    await prisma.subscription.upsert({ where: { technicianId: technician.userId }, update: { plan: technician.isPro ? "pro" : "free", status: "active" }, create: { technicianId: technician.userId, plan: technician.isPro ? "pro" : "free", status: "active" } });
  }
  await prisma.subscription.upsert({
    where: { technicianId: "demo-technician" },
    update: { plan: "pro", status: "active", activeFrom: new Date(), activeUntil: daysFromNow(365) },
    create: { technicianId: "demo-technician", plan: "pro", status: "active", activeFrom: new Date(), activeUntil: daysFromNow(365) }
  });
  await prisma.subscription.upsert({ where: { technicianId: "demo-technician-2" }, update: {}, create: { technicianId: "demo-technician-2", plan: "free" } });

  // ── Primary Jerusalem request with a real, persisted offer ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-old-city-plumbing" },
    update: {
      description: "يوجد تسريب مياه تحت مجلى المطبخ في البلدة القديمة.",
      locationSummary: "البلدة القديمة، القدس",
      area: "البلدة القديمة",
      lat: 31.7781,
      lng: 35.2354,
      urgency: "high",
      status: "matched",
      aiSummary: { likelyIssue: "تسريب في سيفون المجلى أو خرطوم التغذية", confidence: 0.86, urgency: "high" }
    },
    create: {
      id: "demo-request-old-city-plumbing",
      customerId: "demo-customer",
      categoryId: "plumbing",
      description: "يوجد تسريب مياه تحت مجلى المطبخ في البلدة القديمة.",
      locationSummary: "البلدة القديمة، القدس",
      area: "البلدة القديمة",
      lat: 31.7781,
      lng: 35.2354,
      urgency: "high",
      status: "matched",
      aiSummary: { likelyIssue: "تسريب في سيفون المجلى أو خرطوم التغذية", confidence: 0.86, urgency: "high" },
      media: { create: [{ url: "https://example.com/demo/leak.jpg", type: "image" }] }
    }
  });

  // ── Historical completed job (gives reputation, earnings and points real backing data) ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-past" },
    update: { description: "استبدال خلاط الحمام القديم", locationSummary: "باب الساهرة، القدس", area: "باب الساهرة", lat: 31.7864, lng: 35.2325, status: "completed" },
    create: { id: "demo-request-past", customerId: "demo-customer", categoryId: "plumbing", description: "استبدال خلاط الحمام القديم", locationSummary: "باب الساهرة، القدس", area: "باب الساهرة", lat: 31.7864, lng: 35.2325, status: "completed" }
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
      comment: "وصل في الموعد وكان العمل مرتباً ونظيفاً."
    }
  });
  await prisma.offer.upsert({
    where: { requestId_technicianId: { requestId: "demo-request-old-city-plumbing", technicianId: "demo-technician" } },
    update: { price: 110, etaMinutes: 20, message: "قريب من البلدة القديمة وأستطيع فحص التسريب اليوم.", status: "pending" },
    create: { id: "demo-offer-old-city", requestId: "demo-request-old-city-plumbing", technicianId: "demo-technician", price: 110, etaMinutes: 20, message: "قريب من البلدة القديمة وأستطيع فحص التسريب اليوم.", status: "pending" }
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
  await prisma.rewardTransaction.upsert({
    where: { userId_reason_refId: { userId: "demo-customer", reason: "welcome_demo", refId: "jerusalem-showcase" } },
    update: { points: 800 },
    create: { userId: "demo-customer", type: "earn", points: 800, reason: "welcome_demo", refId: "jerusalem-showcase" }
  });

  // ── Active customer job + private conversation ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-active-electric" },
    update: { description: "القاطع الرئيسي يفصل عند تشغيل الفرن والغسالة معاً.", locationSummary: "الشيخ جراح، القدس", area: "الشيخ جراح", lat: 31.7957, lng: 35.2292, urgency: "medium", status: "accepted" },
    create: { id: "demo-request-active-electric", customerId: "demo-customer", categoryId: "electrical", description: "القاطع الرئيسي يفصل عند تشغيل الفرن والغسالة معاً.", locationSummary: "الشيخ جراح، القدس", area: "الشيخ جراح", lat: 31.7957, lng: 35.2292, urgency: "medium", status: "accepted" }
  });
  await prisma.offer.upsert({
    where: { id: "demo-offer-active-electric" },
    update: { price: 145, etaMinutes: 15, message: "أستطيع فحص اللوحة والقاطع اليوم مع ضمان على الإصلاح.", status: "accepted" },
    create: { id: "demo-offer-active-electric", requestId: "demo-request-active-electric", technicianId: "demo-technician", price: 145, etaMinutes: 15, message: "أستطيع فحص اللوحة والقاطع اليوم مع ضمان على الإصلاح.", status: "accepted" }
  });
  await prisma.job.upsert({
    where: { id: "demo-job-active-electric" },
    update: { status: "on_the_way", scheduledAt: new Date() },
    create: { id: "demo-job-active-electric", requestId: "demo-request-active-electric", offerId: "demo-offer-active-electric", customerId: "demo-customer", technicianId: "demo-technician", status: "on_the_way", scheduledAt: new Date() }
  });
  await prisma.conversation.upsert({
    where: { id: "demo-conversation-active" },
    update: {},
    create: { id: "demo-conversation-active", jobId: "demo-job-active-electric", customerId: "demo-customer", technicianId: "demo-technician" }
  });
  const conversationMessages = [
    { id: "demo-message-active-1", senderId: "demo-technician", body: "أهلاً أحمد، راجعت وصف المشكلة وأنا في الطريق إلى الشيخ جراح." },
    { id: "demo-message-active-2", senderId: "demo-customer", body: "تمام، بانتظارك. الموقع موضح داخل الطلب." },
    { id: "demo-message-active-3", senderId: "demo-technician", body: "باقي تقريباً 10 دقائق للوصول." }
  ];
  for (const message of conversationMessages) await prisma.message.upsert({ where: { id: message.id }, update: message, create: { ...message, conversationId: "demo-conversation-active", type: "text" } });

  // ── Customer request with two comparable offers ──
  await prisma.repairRequest.upsert({
    where: { id: "demo-request-offers" },
    update: { description: "سخان المياه لا يسخن والماء يخرج فاتراً فقط.", locationSummary: "وادي الجوز، القدس", area: "وادي الجوز", lat: 31.7930, lng: 35.2380, urgency: "medium", status: "matched" },
    create: { id: "demo-request-offers", customerId: "demo-customer", categoryId: "plumbing", description: "سخان المياه لا يسخن والماء يخرج فاتراً فقط.", locationSummary: "وادي الجوز، القدس", area: "وادي الجوز", lat: 31.7930, lng: 35.2380, urgency: "medium", status: "matched" }
  });
  const showcaseOffers = [
    { id: "demo-showcase-offer-1", technicianId: "tech-user-01", price: 120, etaMinutes: 25, message: "أفحص السخان والوصلات اليوم، والسعر النهائي يتحدد بعد الفحص." },
    { id: "demo-showcase-offer-2", technicianId: "tech-user-07", price: 135, etaMinutes: 18, message: "متاح الآن وقريب من وادي الجوز، يشمل العرض الفحص الأولي." }
  ];
  for (const offer of showcaseOffers) await prisma.offer.upsert({ where: { id: offer.id }, update: { ...offer, status: "pending" }, create: { ...offer, requestId: "demo-request-offers", status: "pending" } });

  // ── Open Jerusalem requests for the technician map/feed ──
  const openRequests = [
    { id: "request-demo-01", customerId: "customer-01", categoryId: "plumbing", description: "يوجد تسريب مياه تحت المجلى ويزداد عند فتح الحنفية.", locationSummary: "سلوان، القدس", area: "سلوان", lat: 31.7756, lng: 35.2368, urgency: "high" as const },
    { id: "request-demo-02", customerId: "customer-02", categoryId: "electrical", description: "قاطع كهرباء المطبخ يفصل عند تشغيل أكثر من جهاز.", locationSummary: "وادي الجوز، القدس", area: "وادي الجوز", lat: 31.7922, lng: 35.2386, urgency: "medium" as const },
    { id: "request-demo-03", customerId: "customer-03", categoryId: "hvac", description: "المكيف يعمل لكن الهواء الخارج غير بارد منذ يومين.", locationSummary: "الشيخ جراح، القدس", area: "الشيخ جراح", lat: 31.7980, lng: 35.2295, urgency: "medium" as const },
    { id: "request-demo-04", customerId: "customer-01", categoryId: "appliances", description: "الغسالة تسرب المياه من الأسفل أثناء دورة الغسيل.", locationSummary: "بيت حنينا، القدس", area: "بيت حنينا", lat: 31.8260, lng: 35.2231, urgency: "low" as const },
    { id: "request-demo-05", customerId: "customer-02", categoryId: "carpentry", description: "باب غرفة النوم يحتك بالأرض ولا يغلق بشكل طبيعي.", locationSummary: "الطور، القدس", area: "الطور", lat: 31.7869, lng: 35.2450, urgency: "low" as const }
  ];
  for (const request of openRequests) await prisma.repairRequest.upsert({ where: { id: request.id }, update: { ...request, status: "open" }, create: { ...request, status: "open" } });

  // One backed review per showcase technician keeps map/profile ratings meaningful.
  for (let index = 0; index < technicians.length; index += 1) {
    const technician = technicians[index]!;
    const customerId = ["customer-01", "customer-02", "customer-03"][index % 3]!;
    const requestId = `demo-history-request-${index + 1}`;
    const offerId = `demo-history-offer-${index + 1}`;
    const jobId = `demo-history-job-${index + 1}`;
    await prisma.repairRequest.upsert({ where: { id: requestId }, update: { status: "completed" }, create: { id: requestId, customerId, categoryId: technician.specialty === "general" ? "general" : technician.specialty, description: `صيانة منزلية مكتملة في القدس بواسطة ${users.find(({ id }) => id === technician.userId)?.name ?? "فني عَمِّرها"}.`, locationSummary: technician.areas[0], area: technician.areas[0], status: "completed" } });
    await prisma.offer.upsert({ where: { id: offerId }, update: { status: "accepted" }, create: { id: offerId, requestId, technicianId: technician.userId, price: 90 + index * 10, etaMinutes: 30, message: "تم تنفيذ الصيانة ضمن السعر والموعد المتفق عليهما.", status: "accepted" } });
    await prisma.job.upsert({ where: { id: jobId }, update: { status: "completed", completedAt: daysFromNow(-(index + 2)) }, create: { id: jobId, requestId, offerId, customerId, technicianId: technician.userId, status: "completed", completedAt: daysFromNow(-(index + 2)) } });
    const score = Math.max(4, Math.round(technician.rating));
    await prisma.review.upsert({ where: { jobId }, update: { overall: score, quality: score, speed: score, commitment: 5, communication: 5 }, create: { jobId, customerId, technicianId: technician.userId, overall: score, quality: score, speed: score, commitment: 5, communication: 5, comment: "فني ملتزم والعمل تم بشكل ممتاز." } });
  }

  const notifications = [
    { id: "demo-notification-offer", type: "new_offer", title: "وصلك عرضان جديدان", body: "قارن عروض الفنيين لطلب سخان المياه في وادي الجوز.", data: { requestId: "demo-request-offers" } },
    { id: "demo-notification-way", type: "on_the_way", title: "الفني في الطريق", body: "طارق المقدسي سيصل إلى الشيخ جراح خلال نحو 10 دقائق.", data: { jobId: "demo-job-active-electric", requestId: "demo-request-active-electric" } },
    { id: "demo-notification-reward", type: "reward", title: "رصيد مكافآت جديد", body: "لديك أكثر من 800 نقطة قابلة للاستبدال لدى شركاء عَمِّرها.", data: { section: "rewards" } },
    { id: "demo-notification-safety", type: "safety", title: "تذكير بحماية حسابك", body: "أبقِ المحادثة والدفع داخل عَمِّرها لضمان حقوقك.", data: {} }
  ];
  for (const notification of notifications) await prisma.notification.upsert({ where: { id: notification.id }, update: notification, create: { ...notification, userId: "demo-customer" } });

  // ── Partners & rewards ──
  await prisma.partner.upsert({ where: { id: "demo-partner-hardware" }, update: { name: "عدد وأدوات باب الساهرة", area: "القدس" }, create: { id: "demo-partner-hardware", name: "عدد وأدوات باب الساهرة", area: "القدس" } });
  await prisma.partner.upsert({ where: { id: "demo-partner-cafe" }, update: { name: "مقهى باب الخليل", area: "البلدة القديمة" }, create: { id: "demo-partner-cafe", name: "مقهى باب الخليل", area: "البلدة القديمة" } });
  const rewards = [
    { id: "demo-reward-hardware", partnerId: "demo-partner-hardware", title: "خصم 10% على العدد والوصلات", pointsCost: 40 },
    { id: "demo-reward-cafe", partnerId: "demo-partner-cafe", title: "قهوة مجانية", pointsCost: 20 },
    { id: "demo-reward-big", partnerId: "demo-partner-hardware", title: "قسيمة مشتريات بقيمة 50 ₪", pointsCost: 500 }
  ];
  for (const r of rewards) await prisma.partnerReward.upsert({ where: { id: r.id }, update: r, create: r });

  // ── Deterministic admin cases ──
  await prisma.report.upsert({
    where: { id: "demo-report-1" },
    update: { reason: "طلب الدفع والتواصل خارج التطبيق", status: "open" },
    create: { id: "demo-report-1", reporterId: "demo-customer", targetUserId: "demo-technician-2", reason: "طلب الدفع والتواصل خارج التطبيق", status: "open" }
  });
  await prisma.riskAssessment.upsert({
    where: { id: "demo-risk-1" },
    update: { level: "medium", score: 0.55, source: "نظام عَمِّرها الذكي", status: "open" },
    create: {
      id: "demo-risk-1",
      userId: "demo-technician-2",
      level: "medium",
      score: 0.55,
      source: "نظام عَمِّرها الذكي",
      status: "open",
      flags: { create: [{ code: "دفع_خارج_المنصة", note: "رُصد طلب للدفع نقداً خارج التطبيق" }] }
    }
  });
  await prisma.riskFlag.updateMany({ where: { assessmentId: "demo-risk-1" }, data: { code: "دفع_خارج_المنصة", note: "رُصد طلب للدفع نقداً خارج التطبيق" } });

  console.log(`Seeded demo data (password for all demo accounts: ${DEMO_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
