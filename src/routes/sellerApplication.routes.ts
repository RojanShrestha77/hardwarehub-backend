import Elysia from "elysia";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware";
import { sellerApplicationController } from "../controller/sellerApplication.controller";

export const sellerApplicationRoutes = new Elysia({ prefix: "/api/seller-applications" })
  // User routes — must be logged in
  .use(authMiddleware)
  .post("/",   sellerApplicationController.apply)
  .get("/me",  sellerApplicationController.getMyApplication)

  // Admin routes — must be admin
  .use(adminAuthMiddleware)
  .get("/",                    sellerApplicationController.getAllApplications)
  .patch("/:id/approve",       sellerApplicationController.approveApplication)
  .patch("/:id/reject",        sellerApplicationController.rejectApplication);
