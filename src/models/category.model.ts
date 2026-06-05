import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id:          uuid("id").defaultRandom().primaryKey(),
    name:        varchar("name", { length: 100 }).notNull().unique(),
    slug:        varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description").notNull(),
    icon:        varchar("icon", { length: 10 }).notNull().default("🔧"),
    createdAt:   timestamp("created_at").defaultNow().notNull(),
    updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export type CategorySelect = typeof categories.$inferSelect;
export type CategoryInsert = typeof categories.$inferInsert;
