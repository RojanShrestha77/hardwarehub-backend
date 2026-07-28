import z from "zod";

export const RegisterSellerDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
});

const ImageItem = z.object({ url: z.string(), isPrimary: z.boolean().default(false) });
const VariantItem = z.object({ label: z.string(), price: z.number().positive(), stock: z.number().int().min(0).default(0) });

export const CreateSellerProductDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  badge: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(ImageItem).optional(),
  variants: z.array(VariantItem).optional(),
  specs: z.record(z.string(), z.string()).optional(),
});

export const UpdateSellerProductDto = CreateSellerProductDto.partial();

export type RegisterSellerDto = z.infer<typeof RegisterSellerDto>;
export type CreateSellerProductDto = z.infer<typeof CreateSellerProductDto>;
export type UpdateSellerProductDto = z.infer<typeof UpdateSellerProductDto>;
