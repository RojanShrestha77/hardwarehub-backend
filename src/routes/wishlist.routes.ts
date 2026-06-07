import { Elysia } from "elysia";
import { wishlistController } from "../controller/wishlist.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const wishlistRoutes = new Elysia({ prefix: "/api/wishlist" })
  .use(authMiddleware)
  .get("/",                   (ctx) => wishlistController.getWishlist(ctx as any))
  .post("/",                  (ctx) => wishlistController.addToWishlist(ctx as any))
  .delete("/clear/all",       (ctx) => wishlistController.clearWishlist(ctx as any))
  .delete("/:productId",      (ctx) => wishlistController.removeFromWishlist(ctx as any));
