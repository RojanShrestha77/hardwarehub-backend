import { Elysia } from "elysia";
import { productController } from "../controller/product.controller";

export const productRoutes = new Elysia({ prefix: "/api/products" })
  .get("/",           (ctx) => productController.getAll(ctx))
  .get("/ids",        (ctx) => productController.getAllIds(ctx))
  .get("/:id",        (ctx) => productController.getById(ctx))
  .post("/",          (ctx) => productController.create(ctx))
  .patch("/:id",      (ctx) => productController.update(ctx))
  .delete("/:id",     (ctx) => productController.delete(ctx));
