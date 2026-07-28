import { eq, ilike, and, gte, lte, desc, asc, or, count, sql } from "drizzle-orm";
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
    page?:     number;
    size?:     number;
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count matching records
    const countResult = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);
    const page = filters.page || 1;
    const size = filters.size || 20;
    const totalPages = Math.ceil(total / size);
    const offset = (page - 1) * size;

    // Fetch page
    let query = db.select().from(products).where(whereClause);

    switch (filters.sort) {
      case "price-asc":  query = query.orderBy(asc(products.price)); break;
      case "price-desc": query = query.orderBy(desc(products.price)); break;
      case "rating":     query = query.orderBy(desc(products.rating)); break;
      default:           query = query.orderBy(desc(products.createdAt));
    }

    query = query.limit(size).offset(offset);
    const data = await query;

    return {
      products: data,
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
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
