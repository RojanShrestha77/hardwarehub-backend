import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/HttpError";

const userRepo = new UserRepository();

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive({ as: "scoped" }, async ({ headers, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      throw new HttpError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      set.status = 401;
      throw new HttpError(401, "Unauthorized: No token provided");
    }

    try {
      const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
      
      if (!decodedToken || !decodedToken.id) {
        set.status = 401;
        throw new HttpError(401, "Unauthorized JWT Unverified");
      }

      const user = await userRepo.getUserById(decodedToken.id);
      if (!user) {
        set.status = 401;
        throw new HttpError(401, "Unauthorized user not found");
      }
      return { user };
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      set.status = 401;
      throw new HttpError(401, "Invalid or expired token");
    }
  });
