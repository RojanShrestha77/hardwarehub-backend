import { Elysia, t } from "elysia";
import { userController } from "../controller/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .use(authMiddleware)
  .get("/me",          (ctx) => userController.getProfile(ctx as any))
  .patch("/me",        (ctx) => userController.updateProfile(ctx as any))
  .patch("/me/avatar", (ctx) => userController.uploadAvatar(ctx as any), {
    body: t.Object({ image: t.File() }),
  })
  .delete("/me",       (ctx) => userController.deleteAccount(ctx as any));
