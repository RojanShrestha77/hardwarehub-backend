import { eq, and, count } from "drizzle-orm";
import { db } from "../database";
import { wishlistItems } from "../models/wishlist.model";
import { products } from "../models/product.model";

export class WishlistRepository {
  async getWishlistByUserId(userId: string) {
    return db
      .select({
        id:        wishlistItems.id,
        addedAt:   wishlistItems.createdAt,
        productId: {
          id:            products.id,
          name:          products.name,
          price:         products.price,
          originalPrice: products.originalPrice,
          category:      products.category,
          brand:         products.brand,
          imageUrl:      products.imageUrl,
          stock:         products.stock,
          rating:        products.rating,
          badge:         products.badge,
        },
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId));
  }

  async getItem(userId: string, productId: string) {
    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return item ?? null;
  }

  async addItem(userId: string, productId: string) {
    const [item] = await db
      .insert(wishlistItems)
      .values({ userId, productId })
      .returning();
    return item;
  }

  async removeItem(userId: string, productId: string) {
    const result = await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
      .returning();
    return result.length > 0;
  }

  async clearWishlist(userId: string) {
    await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async getItemCount(userId: string) {
    const [row] = await db
      .select({ count: count() })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));
    return row?.count ?? 0;
  }
}
