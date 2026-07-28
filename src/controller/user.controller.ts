import { UserRepository } from "../repositories/user.repository";
import { UpdateUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/HttpError";
import type { UserSelect } from "../models/user.model";
import { uploadBuffer } from "../utils/cloudinary";

const userRepo = new UserRepository();

export const userController = {
  async getProfile({ user, set }: { user: UserSelect; set: any }) {
    try {
      const profile = await userRepo.getUserById(user.id);
      if (!profile) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }
      const { password, ...safeUser } = profile;
      return { success: true, message: "Profile fetched", data: safeUser };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async updateProfile({ user, body, set }: { user: UserSelect; body: unknown; set: any }) {
    const parsed = UpdateUserDto.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { success: false, message: parsed.error.issues?.[0]?.message ?? "Invalid data" };
    }
    try {
      const updated = await userRepo.updateUser(user.id, parsed.data);
      if (!updated) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }
      const { password, ...safeUser } = updated;
      return { success: true, message: "Profile updated", data: safeUser };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async uploadAvatar({ user, body, set }: { user: UserSelect; body: any; set: any }) {
    const file = body?.image;
    if (!file || !(file instanceof File)) {
      set.status = 400;
      return { success: false, message: "No image file provided" };
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const imageUrl = await uploadBuffer(buffer, "hardwarehub/avatars", file.type);
      const updated = await userRepo.updateUser(user.id, { imageUrl });
      if (!updated) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }
      const { password, ...safeUser } = updated;
      return { success: true, message: "Avatar uploaded", data: safeUser };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },

  async deleteAccount({ user, set }: { user: UserSelect; set: any }) {
    try {
      await userRepo.deleteUser(user.id);
      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      const err = error as HttpError;
      set.status = err.statusCode || 500;
      return { success: false, message: err.message };
    }
  },
};
