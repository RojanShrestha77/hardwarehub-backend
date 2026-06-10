import { AuthService } from "../services/auth.service";
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from "../dtos/user.dto";
import { HttpError } from "../errors/HttpError";

const authService = new AuthService();

export const authController = {
  async register({ body, set }: { body: unknown; set: any }) {
    const parsed = RegisterDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid registration data" };
    }
    try {
      const user = await authService.register(parsed.data);
      set.status = 201;
      return { success: true, message: "Registration successful", data: user };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async login({ body, set }: { body: unknown; set: any }) {
    const parsed = LoginDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid login data" };
    }
    try {
      const result = await authService.login(parsed.data);
      return { success: true, message: "Login successful", data: result };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async forgotPassword({ body, set }: { body: unknown; set: any }) {
    const parsed = ForgotPasswordDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid email" };
    }
    try {
      await authService.forgotPassword(parsed.data.email);
      // Always return 200 — don't leak whether the email exists
      return { success: true, message: "If that email is registered, a reset link has been sent." };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async resetPassword({ body, set }: { body: unknown; set: any }) {
    const parsed = ResetPasswordDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid input" };
    }
    try {
      await authService.resetPassword(parsed.data.token, parsed.data.newPassword);
      return { success: true, message: "Password reset successfully" };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
