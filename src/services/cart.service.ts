import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/HttpError";
import type { AddToCartDto, UpdateCartItemDto } from "../dtos/cart.dto";

const cartRepo    = new CartRepository();
const productRepo = new ProductRepository();

export class CartService {
  async getCart(userId: string) {
    const items = await cartRepo.getCartByUserId(userId);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return { items, total, count: items.reduce((sum, i) => sum + i.quantity, 0) };
  }

  async addToCart(userId: string, data: AddToCartDto) {
    const product = await productRepo.getProductById(data.productId);
    if (!product) throw new HttpError(404, "Product not found");
    if (product.stock < data.quantity) throw new HttpError(400, "Insufficient stock");

    const existing = await cartRepo.getCartItem(userId, data.productId);
    if (existing) {
      const newQty = existing.quantity + data.quantity;
      if (product.stock < newQty) throw new HttpError(400, "Insufficient stock");
      await cartRepo.updateQuantity(userId, data.productId, newQty);
    } else {
      await cartRepo.addItem({ userId, productId: data.productId, quantity: data.quantity });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, productId: string, data: UpdateCartItemDto) {
    const existing = await cartRepo.getCartItem(userId, productId);
    if (!existing) throw new HttpError(404, "Item not in cart");

    if (data.quantity === 0) {
      await cartRepo.removeItem(userId, productId);
    } else {
      const product = await productRepo.getProductById(productId);
      if (product && product.stock < data.quantity)
        throw new HttpError(400, "Insufficient stock");
      await cartRepo.updateQuantity(userId, productId, data.quantity);
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    const existing = await cartRepo.getCartItem(userId, productId);
    if (!existing) throw new HttpError(404, "Item not in cart");
    await cartRepo.removeItem(userId, productId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await cartRepo.clearCart(userId);
    return { items: [], total: 0, count: 0 };
  }
}
