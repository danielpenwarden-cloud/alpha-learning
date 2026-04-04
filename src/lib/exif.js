// EXIF metadata stripping for image uploads
// Removes GPS, camera info, and other PII-containing metadata from JPEG/PNG images
// by re-drawing on a canvas (which strips all EXIF data).

/**
 * Strips EXIF metadata from an image file by re-encoding via Canvas.
 * Returns a new File with the same name but no metadata.
 * Non-image files are returned unchanged.
 */
export async function stripExif(file) {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Determine output type: keep PNG as PNG, everything else → JPEG
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? 0.92 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to strip EXIF — canvas toBlob returned null'));
            return;
          }
          const stripped = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(stripped);
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // If we can't decode the image, return original
      resolve(file);
    };

    img.src = url;
  });
}
