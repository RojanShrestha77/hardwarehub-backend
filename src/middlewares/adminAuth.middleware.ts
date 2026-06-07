import { Elysia } from "elysia";
import { HttpError } from "../errors/HttpError";

export const adminAuthMiddleware = new Elysia({ name: "admin-auth-middleware" })
  .derive({ as: "scoped" }, async ({ user, set }: any) => {
    if (!user) {
      set.status = 401;
      throw new HttpError(401, "Unauthorized: User not authenticated");
    }
    if (user.role !== "admin") {
      set.status = 403;
      throw new HttpError(403, "Forbidden: Admin role required");
    }
    return { admin: user };
  });
