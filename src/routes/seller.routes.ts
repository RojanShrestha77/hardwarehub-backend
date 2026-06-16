import { Elysia, t } from "elysia";
import { sellerController } from "../controller/seller.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sellerAuthMiddleware } from "../middlewares/sellerAuth.middleware";

// Bun's multipart parser auto-parses JSON-like field values (e.g. '{"k":"v"}' → object,
// '["a","b"]' → array). Every JSON field must accept both the raw string AND the parsed form.
const specsField     = t.Optional(t.Union([t.String(), t.Record(t.String(), t.String())]));
const existingImgsFld = t.Optional(t.Union([t.String(), t.Array(t.String())]));
const variantsFld    = t.Optional(t.Union([t.String(), t.Array(t.Any())]));

const productCreateBody = t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
    price: t.Union([t.Number(), t.String()]),
    originalPrice: t.Optional(t.Union([t.Number(), t.String()])),
    category: t.String(),
    brand: t.String(),
    stock: t.Union([t.Number(), t.String()]),
    badge: t.Optional(t.String()),
    specs: specsField,
    image: t.Optional(t.File()),
    images: t.Optional(t.Union([t.File(), t.Array(t.File())])),
    existingImages: existingImgsFld,
    primaryImageIndex: t.Optional(t.Union([t.Number(), t.String()])),
    variants: variantsFld,
});

const productUpdateBody = t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    price: t.Optional(t.Union([t.Number(), t.String()])),
    originalPrice: t.Optional(t.Union([t.Number(), t.String()])),
    category: t.Optional(t.String()),
    brand: t.Optional(t.String()),
    stock: t.Optional(t.Union([t.Number(), t.String()])),
    badge: t.Optional(t.String()),
    specs: specsField,
    image: t.Optional(t.File()),
    images: t.Optional(t.Union([t.File(), t.Array(t.File())])),
    existingImages: existingImgsFld,
    primaryImageIndex: t.Optional(t.Union([t.Number(), t.String()])),
    variants: variantsFld,
});

export const sellerRoutes = new Elysia({ prefix: "/api/seller" })
    // Seller registration (no auth required)
    .post("/", (ctx) => sellerController.register(ctx))

    // Product management routes (auth + seller role required)
    .use(authMiddleware)
    .use(sellerAuthMiddleware)
    .get("/products", (ctx) => sellerController.getSellerProducts(ctx))
    .post("/products", (ctx) => sellerController.createProduct(ctx), { body: productCreateBody })
    .patch("/products/:id", (ctx) => sellerController.updateProduct(ctx), { body: productUpdateBody })
    .delete("/products/:id", (ctx) => sellerController.deleteProduct(ctx));
