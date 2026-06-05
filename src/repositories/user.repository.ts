import { eq } from "drizzle-orm";
import { db } from "../database";
import { users } from "../models/user.model";
import type { UserSelect, UserInsert } from "../models/user.model";

export interface IUserRepository {
  createUser(userData: Pick<UserInsert, "name" | "email" | "password"> & { role?: string; isApproved?: boolean }): Promise<UserSelect>;
  getUserByEmail(email: string): Promise<UserSelect | undefined>;
  getUserById(userId: string): Promise<UserSelect | undefined>;
  getAllUsers(): Promise<UserSelect[]>;
  updateUser(userId: string, updateData: Partial<UserInsert>): Promise<UserSelect | undefined>;
  deleteUser(userId: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Pick<UserInsert, "name" | "email" | "password"> & { role?: string; isApproved?: boolean }) {
    const [user] = await db.insert(users).values(userData).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getAllUsers() {
    return db.select().from(users);
  }

  async updateUser(userId: string, updateData: Partial<UserInsert>) {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return user;
  }

  async deleteUser(userId: string) {
    const result = await db.delete(users).where(eq(users.id, userId)).returning();
    return result.length > 0;
  }
}
