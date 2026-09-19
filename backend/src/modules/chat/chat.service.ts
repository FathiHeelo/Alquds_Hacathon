import type { Prisma } from "@prisma/client";

import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { chatRepository } from "./chat.repository";

export type MessageInput =
  | { type: "text"; body: string }
  | { type: "image"; body: string }
  | { type: "location"; payload: { lat: number; lng: number; label?: string } };

/** Only the two participants of the job's conversation (or an admin) may read/write. */
const authorize = async (jobId: string, user: { id: string; role: string }) => {
  const conversation = await chatRepository.findByJob(jobId);
  if (!conversation) throw new AppError(ErrorCode.NotFound, "Conversation not found", 404);
  const participant = conversation.customerId === user.id || conversation.technicianId === user.id;
  if (!participant && user.role !== "admin") throw new AppError(ErrorCode.PermissionDenied, "Not a participant of this conversation", 403);
  return { conversation, participant };
};

export const chatService = {
  /** `after` supports polling: only messages newer than the given timestamp. */
  async get(jobId: string, user: { id: string; role: string }, after?: Date) {
    const { conversation } = await authorize(jobId, user);
    return { conversation, messages: await chatRepository.messages(conversation.id, after) };
  },

  async send(jobId: string, user: { id: string; role: string }, input: MessageInput) {
    const { conversation, participant } = await authorize(jobId, user);
    if (!participant) throw new AppError(ErrorCode.PermissionDenied, "Admins cannot post in conversations", 403);
    return chatRepository.createMessage({
      conversationId: conversation.id,
      senderId: user.id,
      type: input.type,
      body: "body" in input ? input.body : undefined,
      payload: "payload" in input ? (input.payload as Prisma.InputJsonValue) : undefined
    });
  }
};
