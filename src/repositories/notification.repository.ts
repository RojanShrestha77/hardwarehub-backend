import { eq, desc, count, and } from "drizzle-orm";
import { db } from "../database";
import { notifications } from "../models/notification.model";
import type { NotificationInsert } from "../models/notification.model";

export class NotificationRepository {
  async getByUserId(userId: string, offset: number, limit: number) {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return { notifications: rows, total: totalRow?.count ?? 0 };
  }

  async getUnreadCount(userId: string) {
    const [row] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return row?.count ?? 0;
  }

  async create(data: Omit<NotificationInsert, "id" | "createdAt">) {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markAsRead(notificationId: string, userId: string) {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return notification ?? null;
  }

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteById(notificationId: string, userId: string) {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async deleteAllByUserId(userId: string) {
    await db.delete(notifications).where(eq(notifications.userId, userId));
  }
}
