import type { Technician } from "../../domain/models/technician";

export const demoTechnicians: readonly Technician[] = [
  {
    id: "tech-tariq-maqdisi",
    name: "طارق المقدسي",
    specialty: "فني سباكة معتمد • البلدة القديمة",
    categoryIds: ["plumbing", "general"],
    rating: 4.9,
    completedJobs: 154,
    distanceKm: 0.9,
    isAvailable: true,
    isVerified: true,
    isPro: true,
    location: { latitude: 31.7804, longitude: 35.2332 }
  },
  {
    id: "tech-mahmoud-khatib",
    name: "محمود الخطيب",
    specialty: "كهرباء وصيانة منازل • الشيخ جراح",
    categoryIds: ["electrical", "electronics"],
    rating: 4.8,
    completedJobs: 96,
    distanceKm: 1.2,
    isAvailable: true,
    isVerified: true,
    isPro: false,
    location: { latitude: 31.7887, longitude: 35.2296 }
  },
  {
    id: "tech-samer-halawani",
    name: "سامر الحلواني",
    specialty: "تكييف وتبريد • وادي الجوز",
    categoryIds: ["ac", "appliances"],
    rating: 4.7,
    completedJobs: 81,
    distanceKm: 1.6,
    isAvailable: true,
    isVerified: true,
    isPro: true,
    location: { latitude: 31.7952, longitude: 35.2368 }
  },
  {
    id: "tech-yousef-najjar",
    name: "يوسف النجار",
    specialty: "نجارة وأثاث منزلي • سلوان",
    categoryIds: ["carpentry", "general"],
    rating: 4.5,
    completedJobs: 63,
    distanceKm: 2.4,
    isAvailable: false,
    isVerified: true,
    isPro: false,
    location: { latitude: 31.7708, longitude: 35.2351 }
  },
  {
    id: "tech-rana-husseini",
    name: "رنا الحسيني",
    specialty: "أجهزة منزلية وإلكترونيات • شعفاط",
    categoryIds: ["appliances", "electronics"],
    rating: 4.6,
    completedJobs: 47,
    distanceKm: 4.8,
    isAvailable: true,
    isVerified: false,
    isPro: false,
    location: { latitude: 31.8122, longitude: 35.2265 }
  }
] as const;
