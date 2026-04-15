// Upload configuration constants (duplicated to avoid server imports in client)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes (increased for lossless PNG output)
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Lossless image compression via Canvas API.
 * - Strips EXIF/GPS/camera metadata (canvas redraw discards all metadata)
 * - Re-encodes as PNG (lossless pixel-perfect output)
 * - Caps dimensions at 2048px on the longest side to keep file sizes practical
 * - If the compressed output is larger than the original, returns the original
 */
export async function compressImageLossless(file: File): Promise<File> {
  // Only process image types the canvas can decode
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Cap at 2048px on longest side to keep upload sizes reasonable
      const MAX_DIM = 2048;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Export as PNG (always lossless)
      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(img.src);

          if (!pngBlob) {
            resolve(file); // Fallback to original on failure
            return;
          }

          // If PNG is smaller or equal, use it (metadata stripped + potentially better encoding)
          // If PNG is larger (common for JPEG→PNG), keep the original to avoid bloat
          if (pngBlob.size <= file.size) {
            const name = file.name.replace(/\.[^.]+$/, ".png");
            resolve(new File([pngBlob], name, { type: "image/png" }));
          } else {
            // Original is already well-compressed — use it as-is
            resolve(file);
          }
        },
        "image/png"
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(file); // Fallback to original on failure
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a single image to Cloudinary via the API.
 * Applies lossless compression before uploading.
 * @param file - The file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_FORMATS.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
  }

  // Apply lossless compression (strips metadata, re-encodes as PNG if smaller)
  const compressed = await compressImageLossless(file);

  // Validate file size after compression
  if (compressed.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const formData = new FormData();
  formData.append("file", compressed);

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
