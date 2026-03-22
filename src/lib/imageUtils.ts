/**
 * Compresses a base64 image string to be under a certain size limit.
 * @param base64Str The base64 encoded image string.
 * @param maxSizeBytes The maximum allowed size in bytes.
 * @param quality The initial quality for JPEG compression (0 to 1).
 * @returns A promise that resolves to the compressed base64 string.
 */
export async function compressBase64Image(
  base64Str: string,
  maxSizeBytes: number = 800000, // Default to ~800KB to be safe under 1MB
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // If the image is very large, scale it down first
      const maxDimension = 1200;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;
      let compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);

      // Iteratively reduce quality if still too large
      // Note: base64 size is roughly 4/3 of the actual byte size
      while (compressedBase64.length * 0.75 > maxSizeBytes && currentQuality > 0.1) {
        currentQuality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(compressedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}
