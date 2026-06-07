import { eq, desc, and, count } from "drizzle-orm";
import { db } from "../database";
import { orders, orderItems } from "../models/order.model";
import type { OrderInsert, OrderItemInsert } from "../models/order.model";

export class OrderRepository {
  async createOrder(
    orderData: Omit<OrderInsert, "id" | "createdAt" | "updatedAt">,
    items: Omit<OrderItemInsert, "id" | "orderId" | "createdAt">[],
  ) {
    return db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      if (!order) throw new Error("Failed to create order");
      const insertedItems = await tx
        .insert(orderItems)
        .values(items.map((item) => ({ ...item, orderId: order.id })))
        .returning();
      return { ...order, items: insertedItems };
    });
  }

  async getOrdersByUserId(userId: string, offset: number, limit: number) {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, userId));

    const ordersWithItems = await Promise.all(
      rows.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      }),
    );

    return { orders: ordersWithItems, total: total?.count ?? 0 };
  }

  async getOrderById(orderId: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    return { ...order, items };
  }

  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
    const updateData: Record<string, any> = { status, updatedAt: new Date() };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return updated ?? null;
  }
}
