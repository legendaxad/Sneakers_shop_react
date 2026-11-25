/** Profile photo rules shared by signup and profile (backend accepts image/* up to 5 MB). */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Returns an error message, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, WebP or GIF image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Please choose an image smaller than 5 MB.';
  return null;
}
