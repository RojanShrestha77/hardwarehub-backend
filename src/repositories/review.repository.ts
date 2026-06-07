import { eq, and, desc, count, avg } from "drizzle-orm";
import { db } from "../database";
import { reviews } from "../models/review.model";
import { users } from "../models/user.model";
import type { ReviewInsert } from "../models/review.model";

export class ReviewRepository {
  async getReviewsByProductId(productId: string, offset: number, limit: number) {
    const rows = await db
      .select({
        id:        reviews.id,
        rating:    reviews.rating,
        comment:   reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        userId: {
          _id:  users.id,
          name: users.name,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    return { reviews: rows, total: totalRow?.count ?? 0 };
  }

  async getProductStats(productId: string) {
    const [row] = await db
      .select({ avgRating: avg(reviews.rating), reviewCount: count() })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    return {
      avgRating:   row?.avgRating ? Number(Number(row.avgRating).toFixed(2)) : 0,
      reviewCount: row?.reviewCount ?? 0,
    };
  }

  async getReviewByUserAndProduct(userId: string, productId: string) {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));
    return review ?? null;
  }

  async getReviewsByUserId(userId: string) {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewById(reviewId: string) {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
    return review ?? null;
  }

  async createReview(data: Omit<ReviewInsert, "id" | "createdAt" | "updatedAt">) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async updateReview(reviewId: string, data: Partial<Pick<ReviewInsert, "rating" | "comment">>) {
    const [review] = await db
      .update(reviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();
    return review ?? null;
  }

  async deleteReview(reviewId: string) {
    const result = await db.delete(reviews).where(eq(reviews.id, reviewId)).returning();
    return result.length > 0;
  }
}
