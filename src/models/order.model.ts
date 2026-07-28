import { pgTable, uuid, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { products } from "./product.model";

export const orders = pgTable("orders", {
  id:                 uuid("id").defaultRandom().primaryKey(),
  userId:             uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderNumber:        varchar("order_number", { length: 30 }).notNull().unique(),
  status:             varchar("status", { length: 20 }).notNull().default("pending"),
  paymentMethod:      varchar("payment_method", { length: 30 }).notNull(),
  paymentStatus:      varchar("payment_status", { length: 30 }).notNull().default("pending_payment"),
  shippingFullName:   varchar("shipping_full_name", { length: 100 }).notNull(),
  shippingPhone:      varchar("shipping_phone", { length: 20 }).notNull(),
  shippingAddress:    text("shipping_address").notNull(),
  shippingCity:       varchar("shipping_city", { length: 100 }).notNull(),
  shippingState:      varchar("shipping_state", { length: 100 }),
  shippingZipCode:    varchar("shipping_zip_code", { length: 20 }).notNull(),
  shippingCountry:    varchar("shipping_country", { length: 100 }).notNull().default("Nepal"),
  subtotal:           integer("subtotal").notNull(),
  shippingCost:       integer("shipping_cost").notNull().default(0),
  tax:                integer("tax").notNull().default(0),
  total:              integer("total").notNull(),
  notes:              text("notes"),
  khaltiPidx:         varchar("khalti_pidx", { length: 100 }),
  createdAt:          timestamp("created_at").defaultNow().notNull(),
  updatedAt:          timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id:            uuid("id").defaultRandom().primaryKey(),
  orderId:       uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId:     uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName:   varchar("product_name", { length: 255 }).notNull(),
  productImage:  text("product_image"),
  productBrand:  varchar("product_brand", { length: 100 }),
  sellerId:      uuid("seller_id"),
  price:         integer("price").notNull(),
  quantity:      integer("quantity").notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export type OrderSelect     = typeof orders.$inferSelect;
export type OrderInsert     = typeof orders.$inferInsert;
export type OrderItemSelect = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
