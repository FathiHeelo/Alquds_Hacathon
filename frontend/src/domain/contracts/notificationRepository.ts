export interface AppNotification { id: string; type: string; title: string; body?: string; read: boolean; createdAt: string; data?: Record<string, unknown>; }
export interface NotificationFeed { unreadCount: number; items: readonly AppNotification[]; }
export interface NotificationRepository { list(): Promise<NotificationFeed>; markRead(id: string): Promise<void>; markAllRead(): Promise<void>; }
