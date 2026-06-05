import { Elysia } from "elysia";
import { authController } from "../controller/auth.controller";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .post("/register", (ctx) => authController.register(ctx))
  .post("/login", (ctx) => authController.login(ctx));
