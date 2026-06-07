import {z} from "zod";

export const CreateIssueDto = z.object({
    productId: z.string().uuid(),
    orderIf: z.string().uuid().optional(),
    title: z.string().min(5).max(150),
    description: z.string().min(10).max(1000),
}) ;

export const CreateSolutionDto = z.object({
    content: z.string().min(5).max(2000),
});

export const UpdateIssueStatusDto = z.object({
    status: z.enum(["open", "solved", "closed"]),
});

export type CreateIssueDto     = z.infer<typeof CreateIssueDto>;
export type CreateSolutionDto  = z.infer<typeof CreateSolutionDto>;
export type UpdateIssueStatusDto = z.infer<typeof UpdateIssueStatusDto>;