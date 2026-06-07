import { z } from "zod";
import { WishlistService } from "../services/wishlist.service";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";

const wishlistService = new WishlistService();

const AddToWishlistDto = z.object({
  productId: z.string().uuid("Invalid product ID"),
});

export const wishlistController = {
  async getWishlist({ user, set }: { user: UserSelect; set: any }) {
    try {
      const wishlist = await wishlistService.getWishlist(user.id);
      return { success: true, message: "Wishlist fetched successfully", data: wishlist };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async addToWishlist({ user, body, set }: { user: UserSelect; body: unknown; set: any }) {
    const parsed = AddToWishlistDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid data" };
    }
    try {
      const wishlist = await wishlistService.addToWishlist(user.id, parsed.data.productId);
      return { success: true, message: "Product added to wishlist", data: wishlist };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async removeFromWishlist({ user, params, set }: { user: UserSelect; params: any; set: any }) {
    try {
      const wishlist = await wishlistService.removeFromWishlist(user.id, params.productId);
      return { success: true, message: "Product removed from wishlist", data: wishlist };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async clearWishlist({ user, set }: { user: UserSelect; set: any }) {
    try {
      const wishlist = await wishlistService.clearWishlist(user.id);
      return { success: true, message: "Wishlist cleared", data: wishlist };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
