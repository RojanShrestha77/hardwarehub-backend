import z from "zod";

export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["user", "admin", "seller"]).default("user"),
    isApproved: z.boolean().default(false),
    imageUrl: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
