import type { Prisma, RepairRequestStatus } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

const include = { category: true, media: true } as const;

export const repairRequestRepository = {
  categories: () => prisma.serviceCategory.findMany({ orderBy: { id: "asc" } }),
  findCategory: (id: string) => prisma.serviceCategory.findUnique({ where: { id } }),
  create: (data: Prisma.RepairRequestUncheckedCreateInput, media: { url: string; type: "image" | "video" | "audio" }[]) =>
    prisma.repairRequest.create({ data: { ...data, media: { create: media } }, include }),
  findById: (id: string, db: Db = prisma) => db.repairRequest.findUnique({ where: { id }, include }),
  listByCustomer: (customerId: string) => prisma.repairRequest.findMany({ where: { customerId }, include, orderBy: { createdAt: "desc" } }),
  feed: (where: Prisma.RepairRequestWhereInput) => prisma.repairRequest.findMany({ where, include, orderBy: { createdAt: "desc" }, take: 50 }),
  update: (id: string, data: Prisma.RepairRequestUpdateInput) => prisma.repairRequest.update({ where: { id }, data, include }),
  replaceMedia: (id: string, media: { url: string; type: "image" | "video" | "audio" }[]) =>
    prisma.$transaction([
      prisma.repairRequestMedia.deleteMany({ where: { requestId: id } }),
      prisma.repairRequestMedia.createMany({ data: media.map((m) => ({ ...m, requestId: id })) })
    ]),
  /** Compare-and-set status; returns true when the transition was applied. */
  transitionStatus: async (id: string, from: RepairRequestStatus[], to: RepairRequestStatus, db: Db = prisma) =>
    (await db.repairRequest.updateMany({ where: { id, status: { in: from } }, data: { status: to } })).count === 1,
  hasTechnicianOffer: async (requestId: string, technicianId: string) =>
    (await prisma.offer.count({ where: { requestId, technicianId } })) > 0
};
