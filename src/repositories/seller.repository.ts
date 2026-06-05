import { eq } from "drizzle-orm";
import { db } from "../database";
import { users } from "../models/user.model";
import { products } from "../models/product.model";
import type { UserSelect, UserInsert } from "../models/user.model";
import type { ProductSelect, ProductInsert } from "../models/product.model";

export class SellerRepository {
    /**
     * Create a new user (seller) in the database
     */
    async createUser(data: Omit<UserInsert, "id" | "createdAt" | "updatedAt">) {
        const [user] = await db.insert(users).values(data).returning();
        if (!user) throw new Error("Failed to create seller");
        return user;
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<UserSelect | null> {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    }

    /**
     * Get all products belonging to a specific seller
     */
    async getProductsBySellerId(sellerId: string): Promise<ProductSelect[]> {
        return db.select().from(products).where(eq(products.sellerId, sellerId));
    }

    /**
     * Get a single product by ID
     */
    async getProductById(productId: string): Promise<ProductSelect | null> {
        const [product] = await db.select().from(products).where(eq(products.id, productId));
        return product ?? null;
    }

    /**
     * Create a new product
     */
    async createProduct(data: Omit<ProductInsert, "id" | "createdAt" | "updatedAt">): Promise<ProductSelect> {
        const [product] = await db.insert(products).values(data).returning();
        if (!product) throw new Error("Failed to create product");
        return product;
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, data: Partial<ProductInsert>): Promise<ProductSelect | null> {
        const [product] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, productId))
            .returning();
        return product ?? null;
    }

    /**
     * Delete a product
     */
    async deleteProduct(productId: string): Promise<boolean> {
        const result = await db.delete(products).where(eq(products.id, productId)).returning();
        return result.length > 0;
    }
}
