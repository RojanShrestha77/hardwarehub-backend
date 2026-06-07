import { Elysia } from "elysia";
import { adminController } from "../controller/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(authMiddleware)
  .use(adminAuthMiddleware)
  // Dashboard
  .get("/stats",                         (ctx) => adminController.getDashboardStats(ctx as any))
  // Orders
  .get("/orders",                        (ctx) => adminController.getAllOrders(ctx as any))
  .patch("/orders/:id/status",           (ctx) => adminController.updateOrderStatus(ctx as any))
  // Users
  .get("/users",                         (ctx) => adminController.getAllUsers(ctx as any))
  .patch("/users/:id",                   (ctx) => adminController.updateUser(ctx as any))
  .delete("/users/:id",                  (ctx) => adminController.deleteUser(ctx as any))
  // Sellers
  .get("/sellers",                       (ctx) => adminController.getSellers(ctx as any))
  .patch("/sellers/:id/approve",         (ctx) => adminController.approveSeller(ctx as any))
  .patch("/sellers/:id/reject",          (ctx) => adminController.rejectSeller(ctx as any))
  // Products
  .get("/products",                      (ctx) => adminController.getAllProducts(ctx as any))
  .delete("/products/:id",               (ctx) => adminController.deleteProduct(ctx as any));
