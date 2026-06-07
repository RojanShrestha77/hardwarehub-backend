import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./product.model";

export const wishlistItems = pgTable("wishlist_items", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_wishlist_user_product").on(table.userId, table.productId),
]);

export type WishlistItemSelect = typeof wishlistItems.$inferSelect;
export type WishlistItemInsert = typeof wishlistItems.$inferInsert;
