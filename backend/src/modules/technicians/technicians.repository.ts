import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

const userSelect = { select: { id: true, name: true, phone: true } } as const;

export const technicianRepository = {
  findProfile: (userId: string, db: Db = prisma) => db.technicianProfile.findUnique({ where: { userId }, include: { user: userSelect } }),
  updateProfile: (userId: string, data: Prisma.TechnicianProfileUpdateInput) =>
    prisma.technicianProfile.update({ where: { userId }, data, include: { user: userSelect } }),
  list: (where: Prisma.TechnicianProfileWhereInput) =>
    prisma.technicianProfile.findMany({
      where,
      include: { user: userSelect },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 50
    }),
  completedJobs: (technicianId: string, db: Db = prisma) => db.job.count({ where: { technicianId, status: "completed" } }),
  reviewAggregate: (technicianId: string, db: Db = prisma) =>
    db.review.aggregate({
      where: { technicianId },
      _avg: { overall: true, quality: true, speed: true, commitment: true, communication: true },
      _count: true
    }),
  reviews: (technicianId: string) => prisma.review.findMany({ where: { technicianId }, orderBy: { createdAt: "desc" }, take: 50 })
};
