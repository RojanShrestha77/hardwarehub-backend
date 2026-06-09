import { db } from "../database";
import { sellerApplications } from "../models/sellerApplication.model";
import { users } from "../models/user.model";
import { eq, desc, count } from "drizzle-orm";
import type { CreateSellerApplicationDto } from "../dtos/sellerApplication.dto";

export const sellerApplicationRepository = {

  async create(userId: string, data: CreateSellerApplicationDto) {
    const [app] = await db
      .insert(sellerApplications)
      .values({ userId, ...data })
      .returning();
    return app;
  },

  async getByUserId(userId: string) {
    const [app] = await db
      .select()
      .from(sellerApplications)
      .where(eq(sellerApplications.userId, userId))
      .orderBy(desc(sellerApplications.createdAt))
      .limit(1);
    return app ?? null;
  },

  async getById(id: string) {
    const [app] = await db
      .select({
        id:              sellerApplications.id,
        userId:          sellerApplications.userId,
        businessName:    sellerApplications.businessName,
        businessType:    sellerApplications.businessType,
        panNumber:       sellerApplications.panNumber,
        phone:           sellerApplications.phone,
        businessAddress: sellerApplications.businessAddress,
        description:     sellerApplications.description,
        status:          sellerApplications.status,
        rejectionReason: sellerApplications.rejectionReason,
        createdAt:       sellerApplications.createdAt,
        user: {
          id:    users.id,
          name:  users.name,
          email: users.email,
        },
      })
      .from(sellerApplications)
      .innerJoin(users, eq(users.id, sellerApplications.userId))
      .where(eq(sellerApplications.id, id));
    return app ?? null;
  },

  async getAll(offset: number, limit: number, status?: string) {
    const where = status ? eq(sellerApplications.status, status) : undefined;

    const rows = await db
      .select({
        id:              sellerApplications.id,
        userId:          sellerApplications.userId,
        businessName:    sellerApplications.businessName,
        businessType:    sellerApplications.businessType,
        panNumber:       sellerApplications.panNumber,
        phone:           sellerApplications.phone,
        businessAddress: sellerApplications.businessAddress,
        description:     sellerApplications.description,
        status:          sellerApplications.status,
        rejectionReason: sellerApplications.rejectionReason,
        createdAt:       sellerApplications.createdAt,
        user: {
          id:    users.id,
          name:  users.name,
          email: users.email,
        },
      })
      .from(sellerApplications)
      .innerJoin(users, eq(users.id, sellerApplications.userId))
      .where(where)
      .orderBy(desc(sellerApplications.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(sellerApplications)
      .where(where);

    return { applications: rows, total: totalRow?.count ?? 0 };
  },

  async updateStatus(id: string, status: string, rejectionReason?: string) {
    const [updated] = await db
      .update(sellerApplications)
      .set({ status, rejectionReason: rejectionReason ?? null, updatedAt: new Date() })
      .where(eq(sellerApplications.id, id))
      .returning();
    return updated ?? null;
  },

  async countPending() {
    const [row] = await db
      .select({ count: count() })
      .from(sellerApplications)
      .where(eq(sellerApplications.status, "pending"));
    return row?.count ?? 0;
  },
};
