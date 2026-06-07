import { pgTable, uuid, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./product.model";

export const reviews = pgTable("reviews", {
  id:        uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating:    integer("rating").notNull(),
  comment:   text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_review_user_product").on(table.userId, table.productId),
]);

export type ReviewSelect = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;
