//cloudinary.js
/**
 * NOTE: Images are now served from Cloudflare R2, not Cloudinary.
 * R2 has no built-in on-the-fly transform API (no c_fill/g_auto/etc.),
 * so this is currently a passthrough. Images are already resized to
 * fit within 1200x1200 server-side (Pillow, in image_upload.py) at
 * upload time, so they arrive pre-sized rather than transformed per-request.
 *
 * If you want real dynamic cropping/resizing back (e.g. different aspect
 * ratios for grid vs. gallery vs. thumbnail), the options are:
 *   1. Cloudflare Images (paid, has an on-the-fly resizing API like Cloudinary)
 *   2. A Cloudflare Worker in front of the R2 bucket that resizes via
 *      the Workers Images binding
 *   3. Pre-generate a few fixed sizes at upload time and store multiple URLs
 *
 * Rename this file to imageUrl.js when you get a chance — kept as
 * cloudinary.js for now so existing imports don't break.
 */
export function getCroppedImageUrl(url, { width = 800, height = 1000 } = {}) {
  return url;
}