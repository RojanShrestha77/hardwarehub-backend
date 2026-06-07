import { NotificationService } from "../services/notification.service";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const notificationService = new NotificationService();

export const notificationController = {
  async getNotifications({ user, query, set }: { user: UserSelect; query: any; set: any }) {
    try {
      const page = Math.max(1, Number(query?.page) || 1);
      const size = Math.min(50, Math.max(1, Number(query?.size) || 20));
      const data = await notificationService.getNotifications(user.id, page, size);
      return { success: true, message: "Notifications fetched successfully", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getUnreadCount({ user, set }: { user: UserSelect; set: any }) {
    try {
      const data = await notificationService.getUnreadCount(user.id);
      return { success: true, message: "Unread count fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async markAsRead({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const notification = await notificationService.markAsRead(user.id, params.id);
      return { success: true, message: "Notification marked as read", data: notification };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async markAllAsRead({ user, set }: { user: UserSelect; set: any }) {
    try {
      await notificationService.markAllAsRead(user.id);
      return { success: true, message: "All notifications marked as read" };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteNotification({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      await notificationService.deleteNotification(user.id, params.id);
      return { success: true, message: "Notification deleted" };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteAllNotifications({ user, set }: { user: UserSelect; set: any }) {
    try {
      await notificationService.deleteAllNotifications(user.id);
      return { success: true, message: "All notifications deleted" };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
