import z from 'zod';
import { UserSchema } from '../types/user.types';

export const RegisterDto = UserSchema.pick({
    name: true,
    email: true,
    password: true,
}).extend({
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
);
export type RegisterDto = z.infer<typeof RegisterDto>;

export const LoginDto = UserSchema.pick({
    email: true,
    password: true,
});
export type LoginDto = z.infer<typeof LoginDto>;

export const UpdateUserDto = UserSchema.partial().omit({
    password: true,
    role: true,
    isApproved: true,
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const ForgotPasswordDto = z.object({
    email: z.string().email("Invalid email address"),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z.object({
    token:       z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;
