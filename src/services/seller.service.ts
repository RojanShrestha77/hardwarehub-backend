import bcryptjs from "bcryptjs";
import { SellerRepository } from "../repositories/seller.repository";
import { HttpError } from "../errors/HttpError";
import type { RegisterSellerDto, CreateSellerProductDto, UpdateSellerProductDto } from "../dtos/seller.dto";

const sellerRepository = new SellerRepository();

export class SellerService {
    /**
     * Register a new seller
     * - Hash password with bcrypt (10 salt rounds)
     * - Check for duplicate email
     * - Create user with role="seller" and isApproved=false
     * - Return user object without password
     */
    async registerSeller(userData: RegisterSellerDto) {
        // Check if email already exists
        const existingUser = await sellerRepository.getUserByEmail(userData.email);
        if (existingUser) {
            throw new HttpError(409, "Email already in use");
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(userData.password, 10);

        // Create seller with role="seller" and isApproved=false
        const newSeller = await sellerRepository.createUser({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: "seller",
            isApproved: false,
        });

        // Return user without password field
        const { password: _, ...sellerWithoutPassword } = newSeller;
        return sellerWithoutPassword;
    }

    async getProductsBySellerId(sellerId: string) {
        return sellerRepository.getProductsBySellerId(sellerId);
    }

    async getProductById(productId: string) {
        return sellerRepository.getProductById(productId);
    }

    /**
     * Create a new product for a seller
     * - Set sellerId on product data
     * - Create product in database
     */
    async createSellerProduct(sellerId: string, productData: CreateSellerProductDto) {
        const productWithSeller = {
            ...productData,
            sellerId,
        };

        const createdProduct = await sellerRepository.createProduct(productWithSeller);
        return createdProduct;
    }

    /**
     * Update a seller's product
     * - Verify product exists (throw 404 if not)
     * - Verify product.sellerId matches sellerId (throw 403 if not)
     * - Update product with new data
     */
    async updateSellerProduct(sellerId: string, productId: string, productData: UpdateSellerProductDto) {
        // Check if product exists
        const existingProduct = await sellerRepository.getProductById(productId);
        if (!existingProduct) {
            throw new HttpError(404, "Product not found");
        }

        // Verify ownership
        if (existingProduct.sellerId !== sellerId) {
            throw new HttpError(403, "Forbidden: You can only update your own products");
        }

        // Update product
        const updatedProduct = await sellerRepository.updateProduct(productId, productData);
        if (!updatedProduct) {
            throw new HttpError(500, "Failed to update product");
        }

        return updatedProduct;
    }

    /**
     * Delete a seller's product
     * - Verify product exists (throw 404 if not)
     * - Verify product.sellerId matches sellerId (throw 403 if not)
     * - Delete product from database
     */
    async deleteSellerProduct(sellerId: string, productId: string) {
        // Check if product exists
        const existingProduct = await sellerRepository.getProductById(productId);
        if (!existingProduct) {
            throw new HttpError(404, "Product not found");
        }

        // Verify ownership
        if (existingProduct.sellerId !== sellerId) {
            throw new HttpError(403, "Forbidden: You can only delete your own products");
        }

        // Delete product
        const deleted = await sellerRepository.deleteProduct(productId);
        if (!deleted) {
            throw new HttpError(500, "Failed to delete product");
        }
    }
}
