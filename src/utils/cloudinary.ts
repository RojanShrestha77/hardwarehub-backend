import { v2 as cloudinary} from "cloudinary";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../configs";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export { cloudinary };

// upload a raw buffer to cloudinary
// return the secure https url

const REMOVE_BG = process.env.CLOUDINARY_REMOVE_BG === "true";

export async function uploadBuffer(
    buffer: Buffer,
    folder = "hardwarehub/products",
    minType = "image/jpeg"
) : Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                format: "webp",
                quality: "auto:good",
                overwrite: false,
                ...(REMOVE_BG && { background_removal: "upload" }),
            },
            (error, result) => {
                if(error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    })
}

// delete an image by its cloudinary public_id.
// the public_id is the path without extension, eg/. "hardwarehub/product/abc123"

export async function deleteByUrl(url: string): Promise<void> {
    // Extract public_id from URL:
  // https://res.cloudinary.com/<cloud>/image/upload/v123/hardwarehub/products/abc.webp
  // → hardwarehub/products/abc
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    const publicId = match?.[1];
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // non-fatal — log only
    console.warn("[cloudinary] deleteByUrl failed for", url);
  }
}