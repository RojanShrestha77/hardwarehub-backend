import { ReviewService } from "../services/review.service";
import { CreateReviewDto, UpdateReviewDto } from "../dtos/review.dto";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const reviewService = new ReviewService();

export const reviewController = {
  async getProductReviews({ params, query, set }: { params: any; query: any; set: any }) {
    try {
      const page = Math.max(1, Number(query?.page) || 1);
      const size = Math.min(50, Math.max(1, Number(query?.size) || 10));
      const data = await reviewService.getProductReviews(params.productId, page, size);
      return { success: true, message: "Reviews fetched successfully", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async createReview({ user, params, body, set }: { user: UserSelect; params: any; body: unknown; set: any }) {
    const parsed = CreateReviewDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid review data" };
    }
    try {
      const review = await reviewService.createReview(user.id, params.productId, parsed.data);
      set.status = 201;
      return { success: true, message: "Review submitted successfully", data: review };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getMyReviews({ user, set }: { user: UserSelect; set: any }) {
    try {
      const reviews = await reviewService.getMyReviews(user.id);
      return { success: true, message: "Reviews fetched successfully", data: reviews };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async updateReview({ user, params, body, set }: { user: UserSelect; params: any; body: unknown; set: any }) {
    const parsed = UpdateReviewDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid update data" };
    }
    try {
      const review = await reviewService.updateReview(user.id, params.id, parsed.data);
      return { success: true, message: "Review updated successfully", data: review };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteReview({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const result = await reviewService.deleteReview(user.id, params.id);
      return { success: true, message: result.message };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
