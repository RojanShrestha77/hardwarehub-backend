import { NotificationRepository } from "../repositories/notification.repository";
import { HttpError } from "../errors/HttpError";

const notificationRepo = new NotificationRepository();

export class NotificationService {
  async getNotifications(userId: string, page: number, size: number) {
    const offset = (page - 1) * size;
    const { notifications, total } = await notificationRepo.getByUserId(userId, offset, size);
    return {
      notifications: notifications.map((n) => ({ ...n, _id: n.id })),
      pagination: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await notificationRepo.getUnreadCount(userId);
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await notificationRepo.markAsRead(notificationId, userId);
    if (!notification) throw new HttpError(404, "Notification not found");
    return { ...notification, _id: notification.id };
  }

  async markAllAsRead(userId: string) {
    await notificationRepo.markAllAsRead(userId);
    return { message: "All notifications marked as read" };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const deleted = await notificationRepo.deleteById(notificationId, userId);
    if (!deleted) throw new HttpError(404, "Notification not found");
    return { message: "Notification deleted" };
  }

  async deleteAllNotifications(userId: string) {
    await notificationRepo.deleteAllByUserId(userId);
    return { message: "All notifications deleted" };
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = "system",
    relatedId?: string,
    actionUrl?: string,
  ) {
    return notificationRepo.create({ userId, title, message, type, relatedId, actionUrl });
  }
}
