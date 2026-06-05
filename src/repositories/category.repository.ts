import { eq } from "drizzle-orm";
import { db } from "../database";
import { categories } from "../models/category.model";
import type { CategorySelect, CategoryInsert } from "../models/category.model";

export class CategoryRepository {
    async getAll(): Promise<CategorySelect[]> {
        return db.select().from(categories).orderBy(categories.name);
    }

    async getById(id: string): Promise<CategorySelect | null> {
        const [cat] = await db.select().from(categories).where(eq(categories.id, id));
        return cat ?? null;
    }

    async getBySlug(slug: string): Promise<CategorySelect | null> {
        const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
        return cat ?? null;
    }

    async getByName(name: string): Promise<CategorySelect | null> {
        const [cat] = await db.select().from(categories).where(eq(categories.name, name));
        return cat ?? null;
    }

    async create(data: Omit<CategoryInsert, "id" | "createdAt" | "updatedAt">): Promise<CategorySelect> {
        const [cat] = await db.insert(categories).values(data).returning();
        if (!cat) throw new Error("Failed to create category");
        return cat;
    }

    async update(id: string, data: Partial<CategoryInsert>): Promise<CategorySelect | null> {
        const [cat] = await db
            .update(categories)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(categories.id, id))
            .returning();
        return cat ?? null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await db.delete(categories).where(eq(categories.id, id)).returning();
        return result.length > 0;
    }
}
