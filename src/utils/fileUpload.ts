import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = join(process.cwd(), "uploads");

if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Save uploaded file to disk
 * Returns the file path relative to the server (e.g., "/uploads/uuid.jpg")
 */
export async function saveFile(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
    }
    if (file.size > MAX_SIZE) {
        throw new Error("File size must be less than 5MB");
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const filePath = join(UPLOAD_DIR, filename);

    const buffer = await file.arrayBuffer();
    writeFileSync(filePath, Buffer.from(buffer));

    return `/uploads/${filename}`;
}

/**
 * Save multiple files
 */
export async function saveFiles(files: File[]): Promise<string[]> {
    return Promise.all(files.map((f) => saveFile(f)));
}
