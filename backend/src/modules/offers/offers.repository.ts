import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

const technicianInclude = {
  technician: { select: { id: true, name: true, technicianProfile: { select: { specialty: true, isVerified: true, isPro: true, ratingAvg: true, ratingCount: true } } } }
} as const;

export const offerRepository = {
  create: (data: Prisma.OfferUncheckedCreateInput) => prisma.offer.create({ data, include: technicianInclude }),
  findById: (id: string, db: Db = prisma) => db.offer.findUnique({ where: { id }, include: { request: true } }),
  listForRequest: (requestId: string) => prisma.offer.findMany({ where: { requestId }, include: technicianInclude, orderBy: { price: "asc" } }),
  listForTechnician: (technicianId: string) =>
    prisma.offer.findMany({ where: { technicianId }, include: { request: { include: { category: true } }, job: true }, orderBy: { createdAt: "desc" } }),
  setStatus: (id: string, status: "pending" | "accepted" | "rejected" | "withdrawn", db: Db = prisma) =>
    db.offer.update({ where: { id }, data: { status } }),
  rejectOthers: (requestId: string, acceptedId: string, db: Db = prisma) =>
    db.offer.updateMany({ where: { requestId, id: { not: acceptedId }, status: "pending" }, data: { status: "rejected" } }),
  withdraw: (id: string, technicianId: string) =>
    prisma.offer.updateMany({ where: { id, technicianId, status: "pending" }, data: { status: "withdrawn" } })
};
