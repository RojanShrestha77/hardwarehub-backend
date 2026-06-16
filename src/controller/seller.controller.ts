import { SellerService } from "../services/seller.service";
import { RegisterSellerDto, CreateSellerProductDto, UpdateSellerProductDto } from "../dtos/seller.dto";
import { HttpError } from "../errors/HttpError";
import { saveFile } from "../utils/fileUpload";
import { deleteByUrl } from "../utils/cloudinary";

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

            // variants arrives as a JSON string from FormData — parse it before validation
            if (body.variants !== undefined) {
                if (typeof body.variants === "string") {
                    try { productPayload.variants = JSON.parse(body.variants); } catch { productPayload.variants = []; }
                } else if (Array.isArray(body.variants)) {
                    productPayload.variants = body.variants;
                }
            }

            // Handle images: combine kept existing URLs + newly uploaded files
            const primaryIndex = Number(body.primaryImageIndex ?? 0);

            // Parse existing image URLs sent from the client (URLs already on Cloudinary).
            // Bun auto-parses JSON-like multipart strings, so handle both string and array.
            let existingUrls: string[] = [];
            if (body.existingImages) {
                if (Array.isArray(body.existingImages)) {
                    existingUrls = body.existingImages;
                } else if (typeof body.existingImages === "string") {
                    try { existingUrls = JSON.parse(body.existingImages); } catch {}
                }
            }

            // Upload any new files
            let newUrls: string[] = [];
            const rawImages = body.images;
            if (rawImages) {
                const files = Array.isArray(rawImages) ? rawImages : [rawImages];
                const validFiles = files.filter((f: any) => f instanceof File && f.size > 0);
                if (validFiles.length > 0) {
                    const { saveFiles } = await import("../utils/fileUpload");
                    newUrls = await saveFiles(validFiles, "hardwarehub/products");
                }
            }

            // Combine: existing first, then new uploads
            const allUrls = [...existingUrls, ...newUrls];
            if (allUrls.length > 0) {
                const safeIndex = Math.min(primaryIndex, allUrls.length - 1);
                productPayload.images = allUrls.map((url: string, i: number) => ({ url, isPrimary: i === safeIndex }));
                productPayload.imageUrl = allUrls[safeIndex];
            } else if (body.image && body.image instanceof File && body.image.size > 0) {
                // fallback: single image field (legacy)
                const imageUrl = await saveFile(body.image);
                productPayload.imageUrl = imageUrl;
                productPayload.images = [{ url: imageUrl, isPrimary: true }];
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

            // variants arrives as a JSON string from FormData — parse it before validation
            if (body.variants !== undefined) {
                if (typeof body.variants === "string") {
                    try { productPayload.variants = JSON.parse(body.variants); } catch { productPayload.variants = []; }
                } else if (Array.isArray(body.variants)) {
                    productPayload.variants = body.variants;
                }
            }

            // Handle images: combine kept existing URLs + newly uploaded files
            const primaryIndex = Number(body.primaryImageIndex ?? 0);

            // Parse existing image URLs sent from the client.
            // Bun auto-parses JSON-like multipart strings, so handle both string and array.
            let existingUrls: string[] = [];
            if (body.existingImages) {
                if (Array.isArray(body.existingImages)) {
                    existingUrls = body.existingImages;
                } else if (typeof body.existingImages === "string") {
                    try { existingUrls = JSON.parse(body.existingImages); } catch {}
                }
            }

            // Upload any new files
            let newUrls: string[] = [];
            const rawImages = body.images;
            if (rawImages) {
                const files = Array.isArray(rawImages) ? rawImages : [rawImages];
                const validFiles = files.filter((f: any) => f instanceof File && f.size > 0);
                if (validFiles.length > 0) {
                    const { saveFiles } = await import("../utils/fileUpload");
                    newUrls = await saveFiles(validFiles, "hardwarehub/products");
                }
            }

            // Combine and apply primary index
            const allUrls = [...existingUrls, ...newUrls];
            if (allUrls.length > 0) {
                const safeIndex = Math.min(primaryIndex, allUrls.length - 1);
                productPayload.images = allUrls.map((url: string, i: number) => ({ url, isPrimary: i === safeIndex }));
                productPayload.imageUrl = allUrls[safeIndex];
            } else if (body.image && body.image instanceof File && body.image.size > 0) {
                const imageUrl = await saveFile(body.image);
                productPayload.imageUrl = imageUrl;
                productPayload.images = [{ url: imageUrl, isPrimary: true }];
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
