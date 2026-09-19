import type { JobStatus, Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

const include = {
  financial: true,
  request: { include: { category: true } },
  offer: { select: { id: true, price: true, etaMinutes: true } },
  conversation: { select: { id: true } },
  review: true
} as const;

export const jobRepository = {
  create: (data: Prisma.JobUncheckedCreateInput, db: Db = prisma) => db.job.create({ data }),
  findById: (id: string, db: Db = prisma) => db.job.findUnique({ where: { id }, include }),
  listForUser: (where: Prisma.JobWhereInput) => prisma.job.findMany({ where, include, orderBy: { createdAt: "desc" } }),
  /** Compare-and-set on status so concurrent transitions cannot both win. */
  transition: async (id: string, from: JobStatus, data: Prisma.JobUpdateManyMutationInput & { status: JobStatus }, db: Db = prisma) =>
    (await db.job.updateMany({ where: { id, status: from }, data })).count === 1,
  createFinancial: (data: Prisma.JobFinancialUncheckedCreateInput, db: Db = prisma) => db.jobFinancial.create({ data })
};
