import z from "zod";

const slugify = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const CreateCategoryDto = z.object({
    name:        z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().min(5, "Description must be at least 5 characters"),
    icon:        z.string().max(10).default("🔧"),
    slug:        z.string().max(100).optional().transform((val, ctx) => {
        if (val) return val;
        const name = (ctx as any)._parent?.data?.name;
        return name ? slugify(name) : "";
    }),
});

export const UpdateCategoryDto = z.object({
    name:        z.string().min(2).max(100).optional(),
    description: z.string().min(5).optional(),
    icon:        z.string().max(10).optional(),
    slug:        z.string().max(100).optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
