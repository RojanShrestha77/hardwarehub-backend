import { Elysia } from "elysia";
import { cartController } from "../controller/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const cartRoutes = new Elysia({ prefix: "/api/cart" })
  .use(authMiddleware)
  .get("/",                  (ctx) => cartController.getCart(ctx as any))
  .post("/",                 (ctx) => cartController.addToCart(ctx as any))
  .patch("/:productId",      (ctx) => cartController.updateItem(ctx as any))
  .delete("/:productId",     (ctx) => cartController.removeItem(ctx as any))
  .delete("/",               (ctx) => cartController.clearCart(ctx as any));
