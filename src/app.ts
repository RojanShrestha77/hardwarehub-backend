import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { FRONTEND_URL } from "./configs";
import { authRoutes } from "./routes/auth.routes";
import { productRoutes } from "./routes/product.routes";
import { cartRoutes } from "./routes/cart.routes";
import { sellerRoutes } from "./routes/seller.routes";
import { categoryRoutes } from "./routes/category.routes";
import { orderRoutes } from "./routes/order.routes";
import { wishlistRoutes } from "./routes/wishlist.routes";
import { reviewRoutes } from "./routes/review.routes";
import { notificationRoutes } from "./routes/notification.routes";
import { adminRoutes } from "./routes/admin.routes";
import { HttpError } from "./errors/HttpError";

export const app = new Elysia()
  .use(cors({ origin: FRONTEND_URL }))
  .use(swagger({ path: "/docs" }))
  .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))
  .onError(({ error, code, set }) => {
    if (error instanceof HttpError) {
      set.status = error.statusCode;
      return { success: false, message: error.message };
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return { success: false, message: (error as any).message ?? "Validation failed" };
    }
    console.error("[unhandled error]", error);
    set.status = 500;
    return { success: false, message: "Internal Server Error" };
  })
  .get("/", () => ({ message: "HardwareHub API is running" }))
  .use(authRoutes)
  .use(productRoutes)
  .use(cartRoutes)
  .use(sellerRoutes)
  .use(categoryRoutes)
  .use(orderRoutes)
  .use(wishlistRoutes)
  .use(reviewRoutes)
  .use(notificationRoutes)
  .use(adminRoutes);
