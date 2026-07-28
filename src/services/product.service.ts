import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/HttpError";
import type { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

const productRepo = new ProductRepository();

export class ProductService {
  async createProduct(data: CreateProductDto) {
    return productRepo.createProduct(data);
  }

  async getAllProducts() {
    return productRepo.getAllProducts();
  }

  async getProductsWithFilters(filters: {
    search?:   string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?:     string;
    page?:     number;
    size?:     number;
  }) {
    return productRepo.getProductsWithFilters(filters);
  }

  async getProductById(id: string) {
    const product = await productRepo.getProductById(id);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const existing = await productRepo.getProductById(id);
    if (!existing) throw new HttpError(404, "Product not found");
    const updated = await productRepo.updateProduct(id, data);
    return updated;
  }

  async deleteProduct(id: string) {
    const existing = await productRepo.getProductById(id);
    if (!existing) throw new HttpError(404, "Product not found");
    await productRepo.deleteProduct(id);
    return { message: "Product deleted successfully" };
  }

  async getAllProductIds() {
    return productRepo.getAllProductIds();
  }
}
