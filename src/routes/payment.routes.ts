import Elysia from "elysia";
import { authMiddleware } from "../middlewares/auth.middleware";
import { paymentController } from "../controller/payment.controller";

export const paymentRoutes = new Elysia({ prefix: "/api/payment" })
  .use(authMiddleware)
  .post("/initiate", paymentController.initiatePayment)
  .post("/verify",   paymentController.verifyPayment);
