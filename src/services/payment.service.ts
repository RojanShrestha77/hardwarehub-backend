import { KHALTI_SECRET_KEY, KHALTI_BASE_URL, FRONTEND_URL } from "../configs";
import { orders } from "../models/order.model";
import { eq } from "drizzle-orm";
import { HttpError } from "../errors/HttpError";
import { NotificationService } from "./notification.service";
import { db } from "../database";

const notificationSvc = new NotificationService();

export const paymentService = {

  async initiateKhaltiPayment(orderId: string, userId: string) {
    // fetch the order that was already created
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new HttpError(404, "Order not found");
    if (order.userId !== userId) throw new HttpError(403, "Forbidden");

    const amountInPaisa = Math.round(order.total * 100);

    const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method:  "POST",
      headers: {
        Authorization:  `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url:           `${FRONTEND_URL}/payment/verify`,
        website_url:           FRONTEND_URL,
        amount:                amountInPaisa,
        purchase_order_id:     order.id,
        purchase_order_name:   `HardwareHub Order #${order.orderNumber}`,
        customer_info: {
          name:  order.shippingFullName,
          phone: order.shippingPhone,
          email: "",
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new HttpError(400, `Khalti error: ${JSON.stringify(err)}`);
    }

    const { pidx, payment_url } = await response.json() as any;

    // save pidx to order so we can verify later
    await db.update(orders)
      .set({ khaltiPidx: pidx, paymentStatus: "pending_payment" })
      .where(eq(orders.id, orderId));

    return { payment_url, pidx, orderId: order.id };
  },

  async verifyKhaltiPayment(pidx: string) {
    const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
      method:  "POST",
      headers: {
        Authorization:  `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const rawText = await response.text();
    console.log("[khalti verify] status:", response.status, "body:", rawText);

    if (!response.ok) {
      throw new HttpError(400, `Failed to verify payment with Khalti: ${rawText}`);
    }

    const data = JSON.parse(rawText) as any;

    console.log("[khalti verify] payment status from Khalti:", data.status);

    if (data.status !== "Completed") {
      throw new HttpError(400, `Payment not completed. Status: ${data.status}`);
    }

    const [order] = await db.select().from(orders).where(eq(orders.khaltiPidx, pidx));
    if (!order) throw new HttpError(404, "Order not found");

    // mark order as paid
    await db.update(orders)
      .set({ paymentStatus: "paid", status: "processing" })
      .where(eq(orders.id, order.id));

    await notificationSvc.createNotification(
      order.userId,
      "Payment Successful",
      `Payment for order #${order.orderNumber} was successful!`,
      "order",
      order.id,
    );

    return { orderId: order.id };
  },
};
