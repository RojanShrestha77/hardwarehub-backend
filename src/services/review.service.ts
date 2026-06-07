import { ReviewRepository } from "../repositories/review.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/HttpError";
import type { CreateReviewDto, UpdateReviewDto } from "../dtos/review.dto";

const reviewRepo  = new ReviewRepository();
const productRepo = new ProductRepository();

async function syncProductStats(productId: string) {
  const { avgRating, reviewCount } = await reviewRepo.getProductStats(productId);
  await productRepo.updateProduct(productId, {
    rating:      String(avgRating) as any,
    reviewCount,
  });
}

export class ReviewService {
  async getProductReviews(productId: string, page: number, size: number) {
    const product = await productRepo.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const offset = (page - 1) * size;
    const { reviews, total } = await reviewRepo.getReviewsByProductId(productId, offset, size);

    const { avgRating } = await reviewRepo.getProductStats(productId);

    return {
      reviews: reviews.map((r) => ({ ...r, _id: r.id })),
      avgRating,
      pagination: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  }

  async createReview(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await productRepo.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const existing = await reviewRepo.getReviewByUserAndProduct(userId, productId);
    if (existing) throw new HttpError(409, "You have already reviewed this product");

    const review = await reviewRepo.createReview({ userId, productId, rating: dto.rating, comment: dto.comment });
    if (!review) throw new HttpError(500, "Failed to create review");
    await syncProductStats(productId);
    return { ...review, _id: review.id };
  }

  async getMyReviews(userId: string) {
    const reviews = await reviewRepo.getReviewsByUserId(userId);
    return reviews.map((r) => ({ ...r, _id: r.id }));
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) throw new HttpError(404, "Review not found");
    if (review.userId !== userId) throw new HttpError(403, "Access denied");

    const updated = await reviewRepo.updateReview(reviewId, dto);
    if (!updated) throw new HttpError(500, "Failed to update review");

    await syncProductStats(review.productId);
    return { ...updated, _id: updated.id };
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) throw new HttpError(404, "Review not found");
    if (review.userId !== userId) throw new HttpError(403, "Access denied");

    await reviewRepo.deleteReview(reviewId);
    await syncProductStats(review.productId);
    return { message: "Review deleted" };
  }
}
