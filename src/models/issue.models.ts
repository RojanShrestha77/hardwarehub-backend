import { pgTable, uuid, text, boolean, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { products } from "./product.model";
import { users } from "./user.model";
import { orders } from "./order.model";

export const productIssues = pgTable("product_issues", {
  id:          uuid("id").defaultRandom().primaryKey(),
  productId:   uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  orderId:     uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  userId:      uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  status:      text("status").notNull().default("open"), // open | solved | closed
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export const issueSolutions = pgTable("issue_solutions", {
  id:         uuid("id").defaultRandom().primaryKey(),
  issueId:    uuid("issue_id").notNull().references(() => productIssues.id, { onDelete: "cascade" }),
  userId:     uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content:    text("content").notNull(),
  isPinned:   boolean("is_pinned").notNull().default(false),   // seller/admin pins best answer
  isAccepted: boolean("is_accepted").notNull().default(false), // issue author marks as solved
  voteCount:  integer("vote_count").notNull().default(0),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const solutionVotes = pgTable("solution_votes", {
  id:         uuid("id").defaultRandom().primaryKey(),
  solutionId: uuid("solution_id").notNull().references(() => issueSolutions.id, { onDelete: "cascade" }),
  userId:     uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_solution_vote").on(table.solutionId, table.userId),
]);
