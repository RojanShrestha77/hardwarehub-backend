import { ProductService } from "../services/product.service";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { HttpError } from "../errors/HttpError";

const productService = new ProductService();

export const productController = {
  async getAll({ query, set }: { query: any; set: any }) {
    try {
      const { search, category, minPrice, maxPrice, sort } = query;
      const page = Math.max(1, Number(query.page) || 1);
      const size = Math.min(100, Math.max(1, Number(query.size) || 20));
      const result = await productService.getProductsWithFilters({
        search,
        category,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
        page,
        size,
      });
      return { success: true, message: "Products fetched successfully", data: result.products, pagination: result.pagination };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getById({ params, set }: { params: any; set: any }) {
    try {
      const product = await productService.getProductById(params.id);
      return { success: true, message: "Product fetched successfully", data: product };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async getAllIds({ set }: { set: any }) {
    try {
      const ids = await productService.getAllProductIds();
      return { success: true, data: ids };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async create({ body, set }: { body: unknown; set: any }) {
    const parsed = CreateProductDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid product data" };
    }
    try {
      const product = await productService.createProduct(parsed.data);
      set.status = 201;
      return { success: true, message: "Product created successfully", data: product };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async update({ params, body, set }: { params: any; body: unknown; set: any }) {
    const parsed = UpdateProductDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid update data" };
    }
    try {
      const product = await productService.updateProduct(params.id, parsed.data);
      return { success: true, message: "Product updated successfully", data: product };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async delete({ params, set }: { params: any; set: any }) {
    try {
      const result = await productService.deleteProduct(params.id);
      return { success: true, message: result.message };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
