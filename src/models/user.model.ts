import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import type { UserType } from "../types/user.types";

// Drizzle table (equivalent to Mongoose Schema)
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("user"),
    isApproved: boolean("is_approved").notNull().default(false),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TypeScript interface (equivalent to IUser extends UserType, Document)
export interface IUser extends UserType {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
