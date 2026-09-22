import { Collections, col } from "../../database/firestore";
import { tsMillis, withId } from "../../shared/firestore.helpers";

interface NotificationDoc {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  readAt: FirebaseFirestore.Timestamp | Date | null;
  createdAt: FirebaseFirestore.Timestamp | Date;
}

const notifications = () => col(Collections.notifications);

export const notificationRepository = {
  create: async (data: { userId: string; type: string; title: string; body?: string; data?: Record<string, unknown> }) => {
    const ref = notifications().doc();
    const doc = { ...data, readAt: null, createdAt: new Date() };
    await ref.set(doc);
    return { id: ref.id, ...doc };
  },
  list: async (userId: string, unreadOnly: boolean) => {
    const snap = await notifications().where("userId", "==", userId).get();
    const rows = snap.docs.map((d) => withId(d as FirebaseFirestore.DocumentSnapshot<NotificationDoc>)).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
    return (unreadOnly ? rows.filter((r) => !r.readAt) : rows).slice(0, 100);
  },
  unreadCount: async (userId: string) => {
    const snap = await notifications().where("userId", "==", userId).get();
    return snap.docs.filter((d) => !(d.data() as NotificationDoc).readAt).length;
  },
  findOwned: async (id: string, userId: string) => {
    const snap = await notifications().doc(id).get();
    return snap.exists && (snap.data() as NotificationDoc).userId === userId ? snap : null;
  },
  markRead: (id: string) => notifications().doc(id).update({ readAt: new Date() }),
  markAllRead: async (userId: string) => {
    const snap = await notifications().where("userId", "==", userId).get();
    const unread = snap.docs.filter((d) => !(d.data() as NotificationDoc).readAt);
    await Promise.all(unread.map((d) => d.ref.update({ readAt: new Date() })));
    return unread.length;
  }
};
