import type { Prisma } from "@prisma/client";

import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import type { Db } from "../../shared/db";
import { notificationRepository } from "./notifications.repository";

/** In-app notification events for the maintenance flow. */
export const NotificationType = {
  NewOffer: "new_offer",
  OfferAccepted: "offer_accepted",
  OnTheWay: "on_the_way",
  Started: "started",
  Completed: "completed",
  RatingRequest: "rating_request",
  Reward: "reward",
  JobCancelled: "job_cancelled"
} as const;

export const notify = (userId: string, type: string, title: string, body?: string, data?: Prisma.InputJsonValue, db?: Db) =>
  notificationRepository.create({ userId, type, title, body, data }, db);

export const notificationService = {
  async list(userId: string, unreadOnly: boolean) {
    const [items, unread] = await Promise.all([notificationRepository.list(userId, unreadOnly), notificationRepository.unreadCount(userId)]);
    return { unreadCount: unread, items };
  },
  async markRead(id: string, userId: string) {
    const found = await notificationRepository.findOwned(id, userId);
    if (!found) throw new AppError(ErrorCode.NotFound, "Notification not found", 404);
    await notificationRepository.markRead(id, userId);
    return { id, read: true };
  },
  async markAllRead(userId: string) {
    const result = await notificationRepository.markAllRead(userId);
    return { updated: result.count };
  }
};
