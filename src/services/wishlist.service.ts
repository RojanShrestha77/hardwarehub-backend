import { WishlistRepository } from "../repositories/wishlist.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/HttpError";

const wishlistRepo = new WishlistRepository();
const productRepo  = new ProductRepository();

export class WishlistService {
  async getWishlist(userId: string) {
    const items      = await wishlistRepo.getWishlistByUserId(userId);
    const itemCount  = items.length;
    return {
      _id:       userId,
      userId,
      items,
      itemCount,
    };
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await productRepo.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const existing = await wishlistRepo.getItem(userId, productId);
    if (existing) throw new HttpError(409, "Product already in wishlist");

    await wishlistRepo.addItem(userId, productId);
    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const removed = await wishlistRepo.removeItem(userId, productId);
    if (!removed) throw new HttpError(404, "Product not in wishlist");
    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string) {
    await wishlistRepo.clearWishlist(userId);
    return { _id: userId, userId, items: [], itemCount: 0 };
  }
}
