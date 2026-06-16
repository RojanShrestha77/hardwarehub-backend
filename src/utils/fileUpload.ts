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

export async function saveFile(file: File, folder?: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await validateImage(buffer);
  return uploadBuffer(buffer, folder ?? "hardwarehub/products", file.type);
}

export async function saveFiles(files: File[], folder?: string): Promise<string[]> {
  return Promise.all(files.map((f) => saveFile(f, folder)));
}
