import type { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { Db } from "../../shared/db";

export const chatRepository = {
  createConversation: (data: Prisma.ConversationUncheckedCreateInput, db: Db = prisma) => db.conversation.create({ data }),
  findByJob: (jobId: string) => prisma.conversation.findUnique({ where: { jobId } }),
  findById: (id: string) => prisma.conversation.findUnique({ where: { id } }),
  messages: (conversationId: string, after?: Date) =>
    prisma.message.findMany({
      where: { conversationId, ...(after ? { createdAt: { gt: after } } : {}) },
      orderBy: { createdAt: "asc" },
      take: 200
    }),
  createMessage: (data: Prisma.MessageUncheckedCreateInput) => prisma.message.create({ data })
};
