import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
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
  JobCancelled: "job_cancelled",
  UrgentDispatch: "urgent_dispatch",
  UrgentDispatchAccepted: "urgent_dispatch_accepted"
} as const;

export const notify = (userId: string, type: string, title: string, body?: string, data?: Record<string, unknown>) =>
  notificationRepository.create({ userId, type, title, body, data });

export const notificationService = {
  async list(userId: string, unreadOnly: boolean) {
    const [items, unread] = await Promise.all([notificationRepository.list(userId, unreadOnly), notificationRepository.unreadCount(userId)]);
    return { unreadCount: unread, items };
  },
  async markRead(id: string, userId: string) {
    if (!(await notificationRepository.findOwned(id, userId))) throw new AppError(ErrorCode.NotFound, "Notification not found", 404);
    await notificationRepository.markRead(id);
    return { id, read: true };
  },
  async markAllRead(userId: string) {
    return { updated: await notificationRepository.markAllRead(userId) };
  }
};
