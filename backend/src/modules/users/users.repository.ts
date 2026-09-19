import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

export const userRepository = {
  findById: (id: string, db: Db = prisma) => db.user.findUnique({ where: { id }, include: { technicianProfile: true } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email }, include: { technicianProfile: true } }),
  findByPhone: (phone: string) => prisma.user.findUnique({ where: { phone } }),
  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data, include: { technicianProfile: true } }),
  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data, include: { technicianProfile: true } })
};

export const publicUser = <T extends { passwordHash?: string | null }>(user: T): Omit<T, "passwordHash"> => {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
};
