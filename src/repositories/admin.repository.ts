import { eq, ne, desc, ilike, and, count, sql, or } from "drizzle-orm";
import { db } from "../database";
import { users } from "../models/user.model";
import { products } from "../models/product.model";
import { orders, orderItems } from "../models/order.model";

export class AdminRepository {
  // ── Dashboard ────────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [[buyers], [sellers], [pending], [prods], [ords], [rev]] = await Promise.all([
      db.select({ count: count() }).from(users).where(eq(users.role, "user")),
      db.select({ count: count() }).from(users).where(eq(users.role, "seller")),
      db.select({ count: count() }).from(users).where(and(eq(users.role, "seller"), eq(users.isApproved, false))),
      db.select({ count: count() }).from(products),
      db.select({ count: count() }).from(orders),
      db.select({ revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)::bigint` })
        .from(orders).where(ne(orders.status, "cancelled")),
    ]);

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8);

    return {
      totalUsers:      buyers?.count  ?? 0,
      totalSellers:    sellers?.count ?? 0,
      pendingSellers:  pending?.count ?? 0,
      totalProducts:   prods?.count   ?? 0,
      totalOrders:     ords?.count    ?? 0,
      totalRevenue:    Number(rev?.revenue ?? 0),
      recentOrders,
    };
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  async getAllOrders(offset: number, limit: number, status?: string) {
    const where = status ? eq(orders.status, status) : undefined;

    const rows = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(orders)
      .where(where);

    const ordersWithItems = await Promise.all(
      rows.map(async (o) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
        return { ...o, items };
      }),
    );

    return { orders: ordersWithItems, total: totalRow?.count ?? 0 };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const paymentStatus =
      status === "delivered" ? "paid"
      : status === "cancelled" ? "not_required"
      : undefined;

    const update: Record<string, any> = { status, updatedAt: new Date() };
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const [updated] = await db
      .update(orders)
      .set(update)
      .where(eq(orders.id, orderId))
      .returning();
    return updated ?? null;
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  async getAllUsers(offset: number, limit: number, role?: string) {
    const where = role ? eq(users.role, role) : undefined;

    const rows = await db
      .select({
        id:         users.id,
        name:       users.name,
        email:      users.email,
        role:       users.role,
        isApproved: users.isApproved,
        imageUrl:   users.imageUrl,
        createdAt:  users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(users)
      .where(where);

    return { users: rows, total: totalRow?.count ?? 0 };
  }

  async updateUser(userId: string, data: { role?: string; isApproved?: boolean }) {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id:         users.id,
        name:       users.name,
        email:      users.email,
        role:       users.role,
        isApproved: users.isApproved,
        createdAt:  users.createdAt,
      });
    return updated ?? null;
  }

  async deleteUser(userId: string) {
    const result = await db.delete(users).where(eq(users.id, userId)).returning();
    return result.length > 0;
  }

  // ── Sellers ────────────────────────────────────────────────────────────────

  async getSellers(offset: number, limit: number, approved?: boolean) {
    const conditions = [eq(users.role, "seller")];
    if (approved !== undefined) conditions.push(eq(users.isApproved, approved));

    const rows = await db
      .select({
        id:         users.id,
        name:       users.name,
        email:      users.email,
        isApproved: users.isApproved,
        imageUrl:   users.imageUrl,
        createdAt:  users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    // Attach product count per seller
    const sellersWithCount = await Promise.all(
      rows.map(async (s) => {
        const [pc] = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.sellerId, s.id));
        return { ...s, productCount: pc?.count ?? 0 };
      }),
    );

    return { sellers: sellersWithCount, total: totalRow?.count ?? 0 };
  }

  async approveSeller(sellerId: string) {
    return this.updateUser(sellerId, { isApproved: true });
  }

  async rejectSeller(sellerId: string) {
    return this.updateUser(sellerId, { isApproved: false });
  }

  // ── Products ────────────────────────────────────────────────────────────────

  async getAllProducts(offset: number, limit: number, search?: string) {
    const where = search
      ? or(ilike(products.name, `%${search}%`), ilike(products.brand, `%${search}%`), ilike(products.category, `%${search}%`))
      : undefined;

    const rows = await db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(products)
      .where(where);

    return { products: rows, total: totalRow?.count ?? 0 };
  }

  async deleteProduct(productId: string) {
    const result = await db.delete(products).where(eq(products.id, productId)).returning();
    return result.length > 0;
  }
}
