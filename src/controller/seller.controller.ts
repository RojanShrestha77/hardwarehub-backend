import { SellerService } from "../services/seller.service";
import { RegisterSellerDto, CreateSellerProductDto, UpdateSellerProductDto } from "../dtos/seller.dto";
import { HttpError } from "../errors/HttpError";
import { saveFile } from "../utils/fileUpload";

const sellerService = new SellerService();

export const sellerController = {
    /**
     * Register a new seller
     * POST /api/seller/
     */
    async register({ body, set }: { body: unknown; set: any }) {
        // Validate request body
        const parsed = RegisterSellerDto.safeParse(body);
        if (!parsed.success) {
            set.status = 400;
            return {
                success: false,
                message: parsed.error.issues?.[0]?.message ?? "Invalid registration data",
            };
        }

        try {
            const seller = await sellerService.registerSeller(parsed.data);
            set.status = 201;
            return {
                success: true,
                message: "Seller registration successful",
                data: seller,
            };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    },

    /**
     * Get all products for the authenticated seller
     * GET /api/seller/products
     */
    async getSellerProducts({ user, set }: { user: any; set: any }) {
        try {
            const sellerId = user.id;
            const products = await sellerService.getProductsBySellerId(sellerId);
            set.status = 200;
            return {
                success: true,
                message: "Products retrieved successfully",
                data: products,
            };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    },

    /**
     * Create a new product for the authenticated seller
     * POST /api/seller/products
     */
    async createProduct({ body, user, set }: { body: any; user: any; set: any }) {
        try {
            const sellerId = user.id;

            // Parse numeric fields
            const productPayload: any = {
                name: body.name,
                description: body.description,
                price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
                category: body.category,
                brand: body.brand,
                stock: typeof body.stock === 'string' ? parseInt(body.stock) : body.stock,
            };

            // Add optional fields
            if (body.originalPrice) {
                productPayload.originalPrice = typeof body.originalPrice === 'string'
                    ? parseFloat(body.originalPrice)
                    : body.originalPrice;
            }
            if (body.badge) {
                productPayload.badge = body.badge;
            }
            if (body.specs) {
                if (typeof body.specs === "string") {
                    try { productPayload.specs = JSON.parse(body.specs); } catch { productPayload.specs = {}; }
                } else if (typeof body.specs === "object") {
                    productPayload.specs = body.specs as Record<string, string>;
                }
            }

            // Extract image file if present
            if (body.image && body.image instanceof File && body.image.size > 0) {
                const imageUrl = await saveFile(body.image);
                productPayload.imageUrl = imageUrl;
            }

            // Validate product data
            const parsed = CreateSellerProductDto.safeParse(productPayload);
            if (!parsed.success) {
                set.status = 400;
                return {
                    success: false,
                    message: parsed.error.issues?.[0]?.message ?? "Invalid product data",
                };
            }

            const product = await sellerService.createSellerProduct(sellerId, parsed.data);
            set.status = 201;
            return {
                success: true,
                message: "Product created successfully",
                data: product,
            };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    },

    /**
     * Update an existing product for the authenticated seller
     * PATCH /api/seller/products/:id
     */
    async updateProduct({ body, params, user, set }: { body: any; params: any; user: any; set: any }) {
        try {
            const sellerId = user.id;
            const productId = params.id;

            // Parse numeric fields if present
            const productPayload: any = {};

            if (body.name !== undefined) productPayload.name = body.name;
            if (body.description !== undefined) productPayload.description = body.description;
            if (body.price !== undefined) {
                productPayload.price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
            }
            if (body.originalPrice !== undefined) {
                productPayload.originalPrice = typeof body.originalPrice === 'string'
                    ? parseFloat(body.originalPrice)
                    : body.originalPrice;
            }
            if (body.category !== undefined) productPayload.category = body.category;
            if (body.brand !== undefined) productPayload.brand = body.brand;
            if (body.stock !== undefined) {
                productPayload.stock = typeof body.stock === 'string' ? parseInt(body.stock) : body.stock;
            }
            if (body.badge !== undefined) productPayload.badge = body.badge;
            if (body.specs !== undefined) {
                if (typeof body.specs === "string") {
                    try { productPayload.specs = JSON.parse(body.specs); } catch { productPayload.specs = {}; }
                } else if (typeof body.specs === "object") {
                    productPayload.specs = body.specs as Record<string, string>;
                }
            }

            // Extract image file if present
            if (body.image && body.image instanceof File && body.image.size > 0) {
                const imageUrl = await saveFile(body.image);
                productPayload.imageUrl = imageUrl;
            }

            // Validate product data
            const parsed = UpdateSellerProductDto.safeParse(productPayload);
            if (!parsed.success) {
                set.status = 400;
                return {
                    success: false,
                    message: parsed.error.issues?.[0]?.message ?? "Invalid product data",
                };
            }

            const product = await sellerService.updateSellerProduct(sellerId, productId, parsed.data);
            set.status = 200;
            return {
                success: true,
                message: "Product updated successfully",
                data: product,
            };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    },

    /**
     * Delete a product for the authenticated seller
     * DELETE /api/seller/products/:id
     */
    async deleteProduct({ params, user, set }: { params: any; user: any; set: any }) {
        try {
            const sellerId = user.id;
            const productId = params.id;
            await sellerService.deleteSellerProduct(sellerId, productId);
            set.status = 200;
            return {
                success: true,
                message: "Product deleted successfully",
            };
        } catch (error) {
            const err = error as HttpError;
            set.status = err.statusCode || 500;
            return {
                success: false,
                message: err.message || "Internal Server Error",
            };
        }
    },
};
