import type { NotificationRepository, NotificationFeed } from "../../domain/contracts/notificationRepository";
let feed: NotificationFeed = { unreadCount: 2, items: [
  { id: "tracking", type: "on_the_way", title: "طارق في طريقه إليك الآن!", body: "المسافة المتبقية 400 متر فقط نحو عقبة الخالدية.", createdAt: new Date().toISOString(), read: false },
  { id: "reward", type: "reward", title: "مبروك! كسبت 50 نقطة عَمِّرها", body: "شكراً لتقييمك الصيانة. يمكنك استبدالها لدى شركائنا.", createdAt: new Date().toISOString(), read: false },
  { id: "safety", type: "safety", title: "أمان بيوت القدس أولاً", body: "أبقِ جميع الاتفاقات المالية داخل تطبيق عَمِّرها لضمان حقك.", createdAt: new Date(0).toISOString(), read: true }
] };
export class DemoNotificationRepository implements NotificationRepository { async list() { return { unreadCount: feed.unreadCount, items: feed.items.map((item) => ({ ...item })) }; } async markRead(id: string) { feed = { items: feed.items.map((item) => item.id === id ? { ...item, read: true } : item), unreadCount: Math.max(0, feed.unreadCount - (feed.items.find((item) => item.id === id)?.read ? 0 : 1)) }; } async markAllRead() { feed = { unreadCount: 0, items: feed.items.map((item) => ({ ...item, read: true })) }; } }
