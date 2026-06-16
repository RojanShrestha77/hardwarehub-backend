import { pgTable, uuid, varchar, text, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const products = pgTable("products", {
  id:            uuid("id").defaultRandom().primaryKey(),
  sellerId:      uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:          varchar("name", { length: 255 }).notNull(),
  description:   text("description"),
  price:         integer("price").notNull(),
  originalPrice: integer("original_price"),
  category:      varchar("category", { length: 100 }).notNull(),
  brand:         varchar("brand", { length: 100 }).notNull(),
  stock:         integer("stock").notNull().default(0),
  rating:        numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount:   integer("review_count").default(0),
  badge:         varchar("badge", { length: 50 }),
  imageUrl:      text("image_url"),
  images:        jsonb("images").$type<Array<{ url: string; isPrimary: boolean }>>(),
  specs:         jsonb("specs").$type<Record<string, string>>(),
  variants: jsonb("variants").$type<Array<{
    label: string;    //e.g, "Small", xl, 256gb
    price: number;
    stock: number;
  }>>(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
});

export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
