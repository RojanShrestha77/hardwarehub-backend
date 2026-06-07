import { Elysia } from "elysia";
import { orderController } from "../controller/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const orderRoutes = new Elysia({ prefix: "/api/orders" })
  .use(authMiddleware)
  .post("/",              (ctx) => orderController.createOrder(ctx as any))
  .get("/my-orders",      (ctx) => orderController.getMyOrders(ctx as any))
  .get("/:id",            (ctx) => orderController.getOrderById(ctx as any))
  .patch("/:id/cancel",   (ctx) => orderController.cancelOrder(ctx as any));
