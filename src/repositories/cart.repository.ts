import { eq, and } from "drizzle-orm";
import { db } from "../database";
import { cartItems } from "../models/cart.model";
import { products } from "../models/product.model";
import type { CartItemInsert } from "../models/cart.model";

export class CartRepository {
  async getCartByUserId(userId: string) {
    return db
      .select({
        id:        cartItems.id,
        quantity:  cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id:            products.id,
          name:          products.name,
          price:         products.price,
          originalPrice: products.originalPrice,
          category:      products.category,
          brand:         products.brand,
          imageUrl:      products.imageUrl,
          stock:         products.stock,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async getCartItem(userId: string, productId: string) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return item ?? null;
  }

  async addItem(data: Omit<CartItemInsert, "id" | "createdAt" | "updatedAt">) {
    const [item] = await db.insert(cartItems).values(data).returning();
    return item;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning();
    return item ?? null;
  }

  async removeItem(userId: string, productId: string) {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning();
    return result.length > 0;
  }

  async clearCart(userId: string) {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
}
