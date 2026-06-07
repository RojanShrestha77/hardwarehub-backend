import { z } from "zod";

const ShippingAddressSchema = z.object({
  fullName:  z.string().min(1, "Full name is required"),
  phone:     z.string().min(1, "Phone is required"),
  address:   z.string().min(1, "Address is required"),
  city:      z.string().min(1, "City is required"),
  state:     z.string().optional(),
  zipCode:   z.string().min(1, "Zip code is required"),
  country:   z.string().default("Nepal"),
});

const OrderItemSchema = z.object({
  productId:    z.string().uuid("Invalid product ID"),
  productName:  z.string().min(1),
  productImage: z.string().optional(),
  quantity:     z.number().int().min(1, "Quantity must be at least 1"),
  price:        z.number().int().min(0),
  sellerId:     z.string().uuid().optional(),
});

export const CreateOrderDto = z.object({
  items:           z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  shippingAddress: ShippingAddressSchema,
  paymentMethod:   z.enum(["cash_on_delivery", "card", "online", "khalti"]),
  shippingCost:    z.number().int().min(0).optional().default(0),
  notes:           z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
