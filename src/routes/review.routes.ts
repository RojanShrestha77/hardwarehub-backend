import { Elysia } from "elysia";
import { reviewController } from "../controller/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const reviewRoutes = new Elysia({ prefix: "/api/reviews" })
  // Public: get reviews for a product (no auth required)
  .get("/product/:productId", (ctx) => reviewController.getProductReviews(ctx as any))
  // Authenticated routes
  .use(authMiddleware)
  .post("/product/:productId", (ctx) => reviewController.createReview(ctx as any))
  .get("/my-reviews",          (ctx) => reviewController.getMyReviews(ctx as any))
  .patch("/:id",               (ctx) => reviewController.updateReview(ctx as any))
  .delete("/:id",              (ctx) => reviewController.deleteReview(ctx as any));
