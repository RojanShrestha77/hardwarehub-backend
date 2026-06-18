// import { existsSync, mkdirSync, writeFileSync } from "fs";
// import { join } from "path";
// import { v4 as uuidv4 } from "uuid";

// const UPLOAD_DIR = join(process.cwd(), "uploads");

// // Ensure uploads directory exists
// if (!existsSync(UPLOAD_DIR)) {
//     mkdirSync(UPLOAD_DIR, { recursive: true });
// }

// /**
//  * Save uploaded file to disk
//  * Returns the file path relative to the server (e.g., "/uploads/uuid.jpg")
//  */
// export async function saveFile(file: File): Promise<string> {
//     // Validate file is an image
//     if (!file.type.startsWith("image/")) {
//         throw new Error("Only image files are allowed");
//     }

//     // Validate file size (5MB max)
//     const MAX_SIZE = 5 * 1024 * 1024; // 5MB
//     if (file.size > MAX_SIZE) {
//         throw new Error("File size must be less than 5MB");
//     }

//     // Generate unique filename
//     const ext = file.name.split(".").pop() || "jpg";
//     const filename = `${uuidv4()}.${ext}`;
//     const filePath = join(UPLOAD_DIR, filename);

//     // Convert file to buffer and save
//     const buffer = await file.arrayBuffer();
//     writeFileSync(filePath, Buffer.from(buffer));

//     // Return relative path
//     return `/uploads/${filename}`;
// }

// /**
//  * Save multiple files
//  */
// export async function saveFiles(files: File[]): Promise<string[]> {
//     const promises = files.map((file) => saveFile(file));
//     return Promise.all(promises);
// }


import sharp from "sharp";
import { uploadBuffer } from "./cloudinary";

const MAX_SIZE    = 5 * 1024 * 1024; // 5 MB
const MIN_DIM     = 400;
const MAX_RATIO   = 3;
const CANVAS_SIZE = 1200;
const PROD_MAX    = 1080; // max product dimension inside canvas (gives 60px padding each side)

async function validateImage(buffer: Buffer): Promise<void> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  if (w < MIN_DIM || h < MIN_DIM) {
    throw new Error(`Image too small: ${w}x${h}. Minimum ${MIN_DIM}x${MIN_DIM}px.`);
  }
  const ratio = w / h;
  if (ratio > MAX_RATIO || ratio < 1 / MAX_RATIO) {
    throw new Error(`Aspect ratio too extreme (${w}x${h}). Keep between 1:${MAX_RATIO} and ${MAX_RATIO}:1.`);
  }
}

/**
 * Composite the product image onto a uniform white square canvas.
 * This ensures every product image has the same dimensions, same
 * white background, and the product is centered — so product cards
 * look consistent regardless of the seller's original image quality.
 */
export async function compositeOnWhiteCanvas(buffer: Buffer): Promise<Buffer> {
  const productPng = await sharp(buffer)
    .resize(PROD_MAX, PROD_MAX, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: productPng, gravity: "center" }])
    .png()
    .toBuffer();
}

export async function saveFile(file: File, folder?: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await validateImage(buffer);
  const composited = await compositeOnWhiteCanvas(buffer);
  return uploadBuffer(composited, folder ?? "hardwarehub/products", file.type);
}

export async function saveFiles(files: File[], folder?: string): Promise<string[]> {
  return Promise.all(files.map((f) => saveFile(f, folder)));
}
