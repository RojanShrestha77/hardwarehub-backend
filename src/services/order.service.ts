import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { NotificationService } from "./notification.service";
import { HttpError } from "../errors/HttpError";
import type { CreateOrderDto } from "../dtos/order.dto";

const orderRepo        = new OrderRepository();
const cartRepo         = new CartRepository();
const notificationSvc  = new NotificationService();

function generateOrderNumber(): string {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `HH-${date}-${suffix}`;
}

function formatOrder(order: any) {
  return {
    ...order,
    _id: order.id,
    shippingAddress: {
      fullName: order.shippingFullName,
      phone:    order.shippingPhone,
      address:  order.shippingAddress,
      city:     order.shippingCity,
      state:    order.shippingState,
      zipCode:  order.shippingZipCode,
      country:  order.shippingCountry,
    },
  };
}

export class OrderService {
  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new HttpError(400, "Order must have at least one item");
    }

    const subtotal    = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = dto.shippingCost ?? (subtotal >= 5000 ? 0 : 200);
    const total       = subtotal + shippingCost;

    const orderData = {
      userId,
      orderNumber:      generateOrderNumber(),
      status:           "pending" as const,
      paymentMethod:    dto.paymentMethod,
      paymentStatus:    dto.paymentMethod === "cash_on_delivery" ? "not_required" : "pending_payment",
      shippingFullName: dto.shippingAddress.fullName,
      shippingPhone:    dto.shippingAddress.phone,
      shippingAddress:  dto.shippingAddress.address,
      shippingCity:     dto.shippingAddress.city,
      shippingState:    dto.shippingAddress.state,
      shippingZipCode:  dto.shippingAddress.zipCode,
      shippingCountry:  dto.shippingAddress.country ?? "Nepal",
      subtotal,
      shippingCost,
      tax:              0,
      total,
      notes:            dto.notes,
    };

    const itemsData = dto.items.map((item) => ({
      productId:    item.productId,
      productName:  item.productName,
      productImage: item.productImage,
      productBrand: undefined as string | undefined,
      sellerId:     item.sellerId,
      price:        item.price,
      quantity:     item.quantity,
    }));

    const order = await orderRepo.createOrder(orderData, itemsData);

    // Clear cart after successful order
    await cartRepo.clearCart(userId);

    // Notify user
    await notificationSvc.createNotification(
      userId,
      "Order Placed",
      `Your order #${order.orderNumber} has been placed successfully. Total: Rs. ${total.toLocaleString()}`,
      "order",
      order.id,
      `/orders/${order.id}`,
    );

    return formatOrder(order);
  }

  async getMyOrders(userId: string, page: number, size: number) {
    const offset = (page - 1) * size;
    const { orders, total } = await orderRepo.getOrdersByUserId(userId, offset, size);
    return {
      orders: orders.map(formatOrder),
      pagination: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await orderRepo.getOrderById(orderId);
    if (!order) throw new HttpError(404, "Order not found");
    if (order.userId !== userId) throw new HttpError(403, "Access denied");
    return formatOrder(order);
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await orderRepo.getOrderById(orderId);
    if (!order) throw new HttpError(404, "Order not found");
    if (order.userId !== userId) throw new HttpError(403, "Access denied");
    if (!["pending", "processing"].includes(order.status)) {
      throw new HttpError(400, "Only pending or processing orders can be cancelled");
    }

    const updated = await orderRepo.updateOrderStatus(orderId, "cancelled");
    if (!updated) throw new HttpError(500, "Failed to cancel order");

    await notificationSvc.createNotification(
      userId,
      "Order Cancelled",
      `Your order #${order.orderNumber} has been cancelled.`,
      "order",
      orderId,
      `/orders/${orderId}`,
    );

    const refreshed = await orderRepo.getOrderById(orderId);
    return formatOrder(refreshed);
  }
}
