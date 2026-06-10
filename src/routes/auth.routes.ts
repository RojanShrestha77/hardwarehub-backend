import { Elysia } from "elysia";
import { authController } from "../controller/auth.controller";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .post("/register",        (ctx) => authController.register(ctx))
  .post("/login",           (ctx) => authController.login(ctx))
  .post("/forgot-password", (ctx) => authController.forgotPassword(ctx))
  .post("/reset-password",  (ctx) => authController.resetPassword(ctx));
