import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload configuration constants
 * These are safe to use in both client and server contexts
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB in bytes
  ALLOWED_FORMATS: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  FOLDER: "products",
};

export { cloudinary };
