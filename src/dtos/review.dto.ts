import { z } from "zod";

export const CreateReviewDto = z.object({
  rating:  z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(2000).optional(),
});

export const UpdateReviewDto = z.object({
  rating:  z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(2000).optional(),
}).refine((d) => d.rating !== undefined || d.comment !== undefined, {
  message: "At least one field (rating or comment) is required",
});

export type CreateReviewDto = z.infer<typeof CreateReviewDto>;
export type UpdateReviewDto = z.infer<typeof UpdateReviewDto>;
