import z from 'zod';
import { UserSchema } from '../types/user.types';

export const RegisterDto = UserSchema.pick({
    name: true,
    email: true,
    password: true,
    role: true,
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
