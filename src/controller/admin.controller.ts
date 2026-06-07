import { z } from "zod";
import { AdminService } from "../services/admin.service";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const adminService = new AdminService();

const UpdateOrderStatusDto = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

const UpdateUserDto = z.object({
  role:       z.enum(["user", "seller", "admin"]).optional(),
  isApproved: z.boolean().optional(),
}).refine((d) => d.role !== undefined || d.isApproved !== undefined, {
  message: "Provide role or isApproved",
});

export const adminController = {
  async getDashboardStats({ set }: { set: any }) {
    try {
      const data = await adminService.getDashboardStats();
      return { success: true, message: "Stats fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  // ── Orders ────────────────────────────────────────────────────────────────

  async getAllOrders({ query, set }: { query: any; set: any }) {
    try {
      const page   = Math.max(1, Number(query?.page) || 1);
      const size   = Math.min(50, Math.max(1, Number(query?.size) || 15));
      const status = query?.status || undefined;
      const data   = await adminService.getAllOrders(page, size, status);
      return { success: true, message: "Orders fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async updateOrderStatus({ params, body, set }: { params: any; body: unknown; set: any }) {
    const parsed = UpdateOrderStatusDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid status" };
    }
    try {
      const order = await adminService.updateOrderStatus(params.id, parsed.data.status);
      return { success: true, message: "Order status updated", data: order };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  // ── Users ────────────────────────────────────────────────────────────────

  async getAllUsers({ query, set }: { query: any; set: any }) {
    try {
      const page = Math.max(1, Number(query?.page) || 1);
      const size = Math.min(50, Math.max(1, Number(query?.size) || 15));
      const role = query?.role || undefined;
      const data = await adminService.getAllUsers(page, size, role);
      return { success: true, message: "Users fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async updateUser({ params, body, set }: { params: any; body: unknown; set: any }) {
    const parsed = UpdateUserDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid data" };
    }
    try {
      const user = await adminService.updateUser(params.id, parsed.data);
      return { success: true, message: "User updated", data: user };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteUser({ admin, params, set }: { admin: UserSelect; params: any; set: any }) {
    try {
      const result = await adminService.deleteUser(params.id, admin.id);
      return { success: true, message: result.message };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  // ── Sellers ────────────────────────────────────────────────────────────────

  async getSellers({ query, set }: { query: any; set: any }) {
    try {
      const page     = Math.max(1, Number(query?.page) || 1);
      const size     = Math.min(50, Math.max(1, Number(query?.size) || 15));
      const approved = query?.approved === "true" ? true : query?.approved === "false" ? false : undefined;
      const data     = await adminService.getSellers(page, size, approved);
      return { success: true, message: "Sellers fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async approveSeller({ params, set }: { params: any; set: any }) {
    try {
      const seller = await adminService.approveSeller(params.id);
      return { success: true, message: "Seller approved", data: seller };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async rejectSeller({ params, set }: { params: any; set: any }) {
    try {
      const seller = await adminService.rejectSeller(params.id);
      return { success: true, message: "Seller rejected", data: seller };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  // ── Products ────────────────────────────────────────────────────────────────

  async getAllProducts({ query, set }: { query: any; set: any }) {
    try {
      const page   = Math.max(1, Number(query?.page) || 1);
      const size   = Math.min(50, Math.max(1, Number(query?.size) || 15));
      const search = query?.search || undefined;
      const data   = await adminService.getAllProducts(page, size, search);
      return { success: true, message: "Products fetched", data };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteProduct({ params, set }: { params: any; set: any }) {
    try {
      const result = await adminService.deleteProduct(params.id);
      return { success: true, message: result.message };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
