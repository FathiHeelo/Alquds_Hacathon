import type { Prisma } from "@prisma/client";

type Decimalish = Prisma.Decimal | number | string;

/** Prisma Decimal -> JS number (2dp) for API responses. */
export const num = (value: Decimalish): number => Math.round(Number(value) * 100) / 100;
