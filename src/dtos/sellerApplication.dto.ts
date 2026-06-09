import { z } from "zod";

export const CreateSellerApplicationDto = z.object({
  businessName:    z.string().min(2).max(100),
  businessType:    z.enum(["individual", "company"]),
  panNumber:       z.string().min(5).max(20),
  phone:           z.string().min(7).max(15),
  businessAddress: z.string().min(5).max(300),
  description:     z.string().min(10).max(1000),
});

export const RejectApplicationDto = z.object({
  reason: z.string().min(5).max(500),
});

export type CreateSellerApplicationDto = z.infer<typeof CreateSellerApplicationDto>;
export type RejectApplicationDto       = z.infer<typeof RejectApplicationDto>;
