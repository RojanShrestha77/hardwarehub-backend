import { AdminRepository } from "../repositories/admin.repository";
import { HttpError } from "../errors/HttpError";

const adminRepo = new AdminRepository();

export class AdminService {
  async getDashboardStats() {
    return adminRepo.getDashboardStats();
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  async getAllOrders(page: number, size: number, status?: string) {
    const offset = (page - 1) * size;
    const { orders, total } = await adminRepo.getAllOrders(offset, size, status);
    return { orders, pagination: { page, size, total, totalPages: Math.ceil(total / size) } };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const valid = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status)) throw new HttpError(400, "Invalid order status");
    const order = await adminRepo.updateOrderStatus(orderId, status);
    if (!order) throw new HttpError(404, "Order not found");
    return order;
  }

  // ── Users ────────────────────────────────────────────────────────────────

  async getAllUsers(page: number, size: number, role?: string) {
    const offset = (page - 1) * size;
    const { users, total } = await adminRepo.getAllUsers(offset, size, role);
    return { users, pagination: { page, size, total, totalPages: Math.ceil(total / size) } };
  }

  async updateUser(userId: string, data: { role?: string; isApproved?: boolean }) {
    const user = await adminRepo.updateUser(userId, data);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async deleteUser(userId: string, requestingAdminId: string) {
    if (userId === requestingAdminId) throw new HttpError(400, "Cannot delete your own account");
    const deleted = await adminRepo.deleteUser(userId);
    if (!deleted) throw new HttpError(404, "User not found");
    return { message: "User deleted" };
  }

  // ── Sellers ────────────────────────────────────────────────────────────────

  async getSellers(page: number, size: number, approved?: boolean) {
    const offset = (page - 1) * size;
    const { sellers, total } = await adminRepo.getSellers(offset, size, approved);
    return { sellers, pagination: { page, size, total, totalPages: Math.ceil(total / size) } };
  }

  async approveSeller(sellerId: string) {
    const seller = await adminRepo.approveSeller(sellerId);
    if (!seller) throw new HttpError(404, "Seller not found");
    return seller;
  }

  async rejectSeller(sellerId: string) {
    const seller = await adminRepo.rejectSeller(sellerId);
    if (!seller) throw new HttpError(404, "Seller not found");
    return seller;
  }

  // ── Products ────────────────────────────────────────────────────────────────

  async getAllProducts(page: number, size: number, search?: string) {
    const offset = (page - 1) * size;
    const { products, total } = await adminRepo.getAllProducts(offset, size, search);
    return { products, pagination: { page, size, total, totalPages: Math.ceil(total / size) } };
  }

  async deleteProduct(productId: string) {
    const deleted = await adminRepo.deleteProduct(productId);
    if (!deleted) throw new HttpError(404, "Product not found");
    return { message: "Product deleted" };
  }
}
