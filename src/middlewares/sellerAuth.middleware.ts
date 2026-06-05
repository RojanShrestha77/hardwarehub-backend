import { Elysia } from "elysia";
import { HttpError } from "../errors/HttpError";

/**
 * Seller Authorization Middleware
 * - Verifies that the authenticated user has role="seller"
 * - Returns 401 if user is not authenticated
 * - Returns 403 if user is not a seller
 * - Passes seller context to downstream handlers
 */
export const sellerAuthMiddleware = new Elysia({ name: "seller-auth-middleware" })
    .derive({ as: "scoped" }, async ({ user, set }) => {
        // Check if user is authenticated
        if (!user) {
            set.status = 401;
            throw new HttpError(401, "Unauthorized: User not authenticated");
        }

        // Check if user has seller role
        if (user.role !== "seller") {
            set.status = 403;
            throw new HttpError(403, "Forbidden: Seller role required");
        }

        // Pass seller context to downstream handlers
        return { seller: user };
    });
