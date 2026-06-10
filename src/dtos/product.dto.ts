import z from "zod";

export const CreateProductDto = z.object({
  name:          z.string().min(2, "Name must be at least 2 characters"),
  description:   z.string().optional(),
  price:         z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  category:      z.string().min(1, "Category is required"),
  brand:         z.string().min(1, "Brand is required"),
  stock:         z.number().int().min(0, "Stock cannot be negative").default(0),
  badge:         z.string().optional(),
  imageUrl:      z.string().url().optional(),
  specs:         z.record(z.string(), z.string()).optional(),
  sellerId:      z.string().uuid("Invalid seller ID"),
});

export const UpdateProductDto = CreateProductDto.partial();

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
