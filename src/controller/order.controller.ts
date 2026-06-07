import { OrderService } from "../services/order.service";
import { CreateOrderDto } from "../dtos/order.dto";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const orderService = new OrderService();

export const orderController = {
  async createOrder({ user, body, set }: { user: UserSelect; body: unknown; set: any }) {
    const parsed = CreateOrderDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid order data" };
    }
    try {
      const order = await orderService.createOrder(user.id, parsed.data);
      set.status = 201;
      return { success: true, message: "Order placed successfully", data: order };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getMyOrders({ user, query, set }: { user: UserSelect; query: any; set: any }) {
    try {
      const page = Math.max(1, Number(query?.page) || 1);
      const size = Math.min(50, Math.max(1, Number(query?.size) || 10));
      const data = await orderService.getMyOrders(user.id, page, size);
      return { success: true, message: "Orders fetched successfully", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getOrderById({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const order = await orderService.getOrderById(user.id, params.id);
      return { success: true, message: "Order fetched successfully", data: order };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async cancelOrder({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const order = await orderService.cancelOrder(user.id, params.id);
      return { success: true, message: "Order cancelled successfully", data: order };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
