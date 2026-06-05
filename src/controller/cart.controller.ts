import { CartService } from "../services/cart.service";
import { AddToCartDto, UpdateCartItemDto } from "../dtos/cart.dto";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const cartService = new CartService();

export const cartController = {
  async getCart({ user, set }: { user: UserSelect; set: any }) {
    try {
      const cart = await cartService.getCart(user.id);
      return { success: true, message: "Cart fetched successfully", data: cart };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async addToCart({ user, body, set }: { user: UserSelect; body: unknown; set: any }) {
    const parsed = AddToCartDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid cart data" };
    }
    try {
      const cart = await cartService.addToCart(user.id, parsed.data);
      return { success: true, message: "Item added to cart", data: cart };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async updateItem({ user, params, body, set }: { user: UserSelect; params: any; body: unknown; set: any }) {
    const parsed = UpdateCartItemDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid data" };
    }
    try {
      const cart = await cartService.updateCartItem(user.id, params.productId, parsed.data);
      return { success: true, message: "Cart item updated", data: cart };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async removeItem({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const cart = await cartService.removeFromCart(user.id, params.productId);
      return { success: true, message: "Item removed from cart", data: cart };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async clearCart({ user, set }: { user: UserSelect; set: any }) {
    try {
      const cart = await cartService.clearCart(user.id);
      return { success: true, message: "Cart cleared", data: cart };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
