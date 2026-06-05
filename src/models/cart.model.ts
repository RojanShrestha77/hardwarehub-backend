import { pgTable, uuid, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./product.model";

export const cartItems = pgTable("cart_items", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity:  integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_user_product").on(table.userId, table.productId),
]);

export type CartItemSelect = typeof cartItems.$inferSelect;
export type CartItemInsert = typeof cartItems.$inferInsert;
