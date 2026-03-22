// Upload configuration constants (duplicated to avoid server imports in client)
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Upload a single image to Cloudinary via the API
 * @param file - The file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_FORMATS.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload image");
  }

  const data = await response.json();
  return data.url;
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of files to upload
 * @returns Array of uploaded image URLs
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  // Upload images sequentially to avoid overwhelming the server
  const urls: string[] = [];
  
  for (const file of files) {
    const url = await uploadImage(file);
    urls.push(url);
  }

  return urls;
}

/**
 * Optimize a Cloudinary image URL with transformations
 * @param url - Original Cloudinary image URL
 * @param width - Desired width (default: 500)
 * @returns Optimized image URL
 */
export function optimizeImage(url: string, width = 500): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

/**
 * Generate srcset for responsive images
 * @param url - Original Cloudinary image URL
 * @returns srcset string for responsive images
 */
export function generateSrcSet(url: string): string {
  if (!url || !url.includes("cloudinary.com")) {
    return "";
  }

  const widths = [250, 500, 750, 1000];
  return widths
    .map((w) => `${optimizeImage(url, w)} ${w}w`)
    .join(", ");
}
