import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { JWT_SECRET } from "../configs";
import type { RegisterDto, LoginDto } from "../dtos/user.dto";
import { HttpError } from "../errors/HttpError";
import { sendEmail } from "../configs/email";
import { passwordResetTemplate } from "../utils/emailTemplates";

const userRepository = new UserRepository();

export class AuthService {
  async register(userData: RegisterDto) {
    const existing = await userRepository.getUserByEmail(userData.email);
    if (existing) throw new HttpError(409, "Email already in use");

    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    const newUser = await userRepository.createUser({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role ?? "user",
      isApproved: userData.role === "seller" ? false : true,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(loginData: LoginDto) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) throw new HttpError(404, "User not found");

    const validPassword = await bcryptjs.compare(loginData.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.getUserByEmail(email);
    // Always return success to avoid email enumeration
    if (!user) return;

    const resetToken = jwt.sign(
      { id: user.id, purpose: "password_reset" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { subject, html } = passwordResetTemplate({
      customerName: user.name,
      resetToken,
    });

    await sendEmail(user.email, subject, html);
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      throw new HttpError(400, "Invalid or expired reset token");
    }

    if (payload.purpose !== "password_reset") {
      throw new HttpError(400, "Invalid reset token");
    }

    const user = await userRepository.getUserById(payload.id);
    if (!user) throw new HttpError(404, "User not found");

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.updateUser(user.id, { password: hashedPassword });
  }
}
