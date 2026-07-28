import { paymentService } from "../services/payment.service";

export const paymentController = {
    async initiatePayment({ body, user, set}: any) {
        const {orderId} = body;
        if(!orderId) {
            set.status = 400;
            return { success: false, message: "orderId is required"};
        }
        const result = await paymentService.initiateKhaltiPayment(orderId, user.id);
        return { success: true, message: "Payment initiated", data: result };
    },

    async verifyPayment({body, set}: any) {
        const {pidx} = body;
        if(!pidx) {
            set.status = 400;
            return { success: false, message: "pidx is required"};
        }
        try {
            const result = await paymentService.verifyKhaltiPayment(pidx);
            return { success: true, message: "Payment verified", data: result };
        } catch (error: any) {
            console.error("[khalti verify] controller error:", error.message);
            set.status = error.statusCode || 400;
            return { success: false, message: error.message || "Payment verification failed" };
        }
    }
}