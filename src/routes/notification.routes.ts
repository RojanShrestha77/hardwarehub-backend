import { Elysia } from "elysia";
import { notificationController } from "../controller/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const notificationRoutes = new Elysia({ prefix: "/api/notifications" })
  .use(authMiddleware)
  .get("/",                   (ctx) => notificationController.getNotifications(ctx as any))
  .get("/unread-count",       (ctx) => notificationController.getUnreadCount(ctx as any))
  .patch("/mark-all-read",    (ctx) => notificationController.markAllAsRead(ctx as any))
  .patch("/:id/read",         (ctx) => notificationController.markAsRead(ctx as any))
  .delete("/",                (ctx) => notificationController.deleteAllNotifications(ctx as any))
  .delete("/:id",             (ctx) => notificationController.deleteNotification(ctx as any));
