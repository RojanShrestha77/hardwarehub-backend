import z from "zod";

// Seller registration DTO
export const RegisterSellerDto = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    role: z.literal("seller"),
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
);

export type RegisterSellerDto = z.infer<typeof RegisterSellerDto>;

// Seller product creation DTO (sellerId will be injected from auth context)
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
    specs: z.record(z.string(), z.string()).optional(),
});

export type CreateSellerProductDto = z.infer<typeof CreateSellerProductDto>;

// Seller product update DTO
export const UpdateSellerProductDto = CreateSellerProductDto.partial();

export type UpdateSellerProductDto = z.infer<typeof UpdateSellerProductDto>;
