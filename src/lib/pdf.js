// PDF → image rendering using pdf.js
// Renders each page to a canvas, returns base64 PNG images for Claude vision analysis

import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

/**
 * Render a PDF file to an array of base64 PNG images (one per page).
 * @param {File} file - The PDF file
 * @param {object} opts
 * @param {number} opts.maxPages - Max pages to render (default 5)
 * @param {number} opts.scale - Render scale (default 2 for good readability)
 * @returns {Promise<string[]>} Array of base64 PNG strings (no data: prefix)
 */
export async function pdfToImages(file, { maxPages = 5, scale = 2 } = {}) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = Math.min(pdf.numPages, maxPages);
  const images = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to base64 PNG, strip the data:image/png;base64, prefix
    const dataUrl = canvas.toDataURL('image/png');
    images.push(dataUrl.split(',')[1]);

    page.cleanup();
  }

  return images;
}
