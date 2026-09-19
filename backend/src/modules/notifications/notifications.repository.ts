import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

export const notificationRepository = {
  create: (data: Prisma.NotificationUncheckedCreateInput, db: Db = prisma) => db.notification.create({ data }),
  list: (userId: string, unreadOnly: boolean) =>
    prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
  unreadCount: (userId: string) => prisma.notification.count({ where: { userId, readAt: null } }),
  markRead: (id: string, userId: string) =>
    prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } }),
  markAllRead: (userId: string) => prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } }),
  findOwned: (id: string, userId: string) => prisma.notification.findFirst({ where: { id, userId } })
};
