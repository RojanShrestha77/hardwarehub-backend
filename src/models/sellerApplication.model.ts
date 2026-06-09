import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const sellerApplications = pgTable("seller_applications", {
  id:              uuid("id").defaultRandom().primaryKey(),
  userId:          uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName:    text("business_name").notNull(),
  businessType:    text("business_type").notNull(), // individual | company
  panNumber:       text("pan_number").notNull(),
  phone:           text("phone").notNull(),
  businessAddress: text("business_address").notNull(),
  description:     text("description").notNull(),
  status:          text("status").notNull().default("pending"), // pending | approved | rejected
  rejectionReason: text("rejection_reason"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

export type SellerApplicationSelect = typeof sellerApplications.$inferSelect;
export type SellerApplicationInsert = typeof sellerApplications.$inferInsert;
