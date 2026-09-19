import type { Prisma, PrismaClient } from "@prisma/client";

/** Repositories accept either the global client or a transaction client. */
export type Db = PrismaClient | Prisma.TransactionClient;
