import z from "zod";

export const AddToCartDto = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity:  z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export type AddToCartDto = z.infer<typeof AddToCartDto>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;
