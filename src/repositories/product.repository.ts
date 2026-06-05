import { eq, ilike, and, gte, lte, desc, asc, or } from "drizzle-orm";
import { db } from "../database";
import { products } from "../models/product.model";
import type { ProductSelect, ProductInsert } from "../models/product.model";

export class ProductRepository {
  async createProduct(data: Omit<ProductInsert, "id" | "createdAt" | "updatedAt">) {
    const [product] = await db.insert(products).values(data).returning();
    if (!product) throw new Error("Failed to create product");
    return product;
  }

  async getAllProducts() {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: string) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ?? null;
  }

  async getProductsWithFilters(filters: {
    search?:   string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?:     string;
  }) {
    const conditions = [];

    if (filters.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.brand, `%${filters.search}%`),
          ilike(products.category, `%${filters.search}%`)
        )
      );
    }
    if (filters.category) {
      conditions.push(ilike(products.category, filters.category));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice));
    }

    const query = db.select().from(products);
    if (conditions.length > 0) query.where(and(...conditions));

    switch (filters.sort) {
      case "price-asc":  return query.orderBy(asc(products.price));
      case "price-desc": return query.orderBy(desc(products.price));
      case "rating":     return query.orderBy(desc(products.rating));
      default:           return query.orderBy(desc(products.createdAt));
    }
  }

  async updateProduct(id: string, data: Partial<ProductInsert>) {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product ?? null;
  }

  async deleteProduct(id: string) {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getAllProductIds() {
    const rows = await db.select({ id: products.id }).from(products);
    return rows.map((r) => r.id);
  }
}
