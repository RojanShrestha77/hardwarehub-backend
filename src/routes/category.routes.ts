import { Elysia } from "elysia";
import { categoryController } from "../controller/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sellerAuthMiddleware } from "../middlewares/sellerAuth.middleware";

export const categoryRoutes = new Elysia({ prefix: "/api/categories" })
    // Public — anyone can list categories
    .get("/",      (ctx) => categoryController.getAll(ctx))
    .get("/:id",   (ctx) => categoryController.getById(ctx))

    // Protected — only admins / sellers can manage categories
    .use(authMiddleware)
    .post("/",      (ctx) => categoryController.create(ctx))
    .patch("/:id",  (ctx) => categoryController.update(ctx))
    .delete("/:id", (ctx) => categoryController.delete(ctx));
