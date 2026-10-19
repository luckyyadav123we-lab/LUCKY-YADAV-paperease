import { ImageProcessOptions } from '../types';

/**
 * Load a File or Blob into an HTMLImageElement safely.
 */
export function loadImage(fileOrBlob: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file. Please ensure it is a valid format.'));
    };
    img.src = url;
  });
}

/**
 * Process and convert an image with canvas transformations, format encoding, and quality controls.
 */
export async function processImage(
  file: File,
  options: ImageProcessOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; width: number; height: number; originalSize: number; newSize: number }> {
  onProgress?.(20, 'Loading image into memory canvas...');
  const img = await loadImage(file);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Determine output dimensions
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (options.widthPercent && options.widthPercent > 0) {
    const scale = options.widthPercent / 100;
    targetWidth = Math.round(originalWidth * scale);
    targetHeight = Math.round(originalHeight * scale);
  } else if (options.maxWidth || options.maxHeight) {
    const maxWidth = options.maxWidth || originalWidth;
    const maxHeight = options.maxHeight || originalHeight;
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);
    targetWidth = Math.round(originalWidth * ratio);
    targetHeight = Math.round(originalHeight * ratio);
  }

  onProgress?.(45, 'Applying image transformations...');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not initialize 2D rendering canvas context.');

  const rotation = options.rotate || 0;
  const isPerpendicular = rotation === 90 || rotation === 270;
  canvas.width = isPerpendicular ? targetHeight : targetWidth;
  canvas.height = isPerpendicular ? targetWidth : targetHeight;

  // Handle transparent background replacement for JPG
  const mimeType =
    options.targetFormat === 'png'
      ? 'image/png'
      : options.targetFormat === 'webp'
      ? 'image/webp'
      : options.targetFormat === 'bmp'
      ? 'image/bmp'
      : 'image/jpeg';

  if (mimeType === 'image/jpeg') {
    const bg = options.backgroundColorForTransparency || '#FFFFFF';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  // Apply transformations: Rotation & Flip
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  if (options.flipHorizontal || options.flipVertical) {
    ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  }

  // Draw the image onto the transformed canvas
  ctx.drawImage(
    img,
    -targetWidth / 2,
    -targetHeight / 2,
    targetWidth,
    targetHeight
  );
  ctx.restore();

  // Apply filters: Grayscale, Brightness, Contrast
  if (options.grayscale || options.brightness || options.contrast) {
    onProgress?.(65, 'Applying color and contrast filters...');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const bDelta = options.brightness || 0; // -100 to 100
    const cFactor = ((options.contrast || 0) + 100) / 100; // factor

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Grayscale
      if (options.grayscale) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      }

      // Brightness
      if (bDelta !== 0) {
        r = Math.min(255, Math.max(0, r + bDelta * 1.5));
        g = Math.min(255, Math.max(0, g + bDelta * 1.5));
        b = Math.min(255, Math.max(0, b + bDelta * 1.5));
      }

      // Contrast
      if (options.contrast !== 0 && options.contrast !== undefined) {
        r = Math.min(255, Math.max(0, (r - 128) * cFactor + 128));
        g = Math.min(255, Math.max(0, (g - 128) * cFactor + 128));
        b = Math.min(255, Math.max(0, (b - 128) * cFactor + 128));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // Watermark text overlay
  if (options.watermarkText?.trim()) {
    onProgress?.(75, 'Embedding watermark overlay...');
    const text = options.watermarkText.trim();
    ctx.save();
    const fontSize = Math.max(16, Math.round(canvas.width / 22));
    ctx.font = `600 ${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    const padding = 20;
    const textMetrics = ctx.measureText(text);
    const textX = canvas.width - textMetrics.width - padding;
    const textY = canvas.height - padding;
    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);
    ctx.restore();
  }

  onProgress?.(85, `Encoding into ${options.targetFormat.toUpperCase()}...`);
  const quality = Math.max(0.1, Math.min(1.0, options.quality || 0.85));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode output image blob.'));
      },
      mimeType,
      quality
    );
  });

  onProgress?.(100, 'Image conversion complete!');
  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    originalSize: file.size,
    newSize: blob.size,
  };
}

/**
 * Fast helper to get image preview URL and dimensions.
 */
export async function getImageMetadata(file: File): Promise<{ width: number; height: number; previewUrl: string }> {
  const img = await loadImage(file);
  const previewUrl = URL.createObjectURL(file);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    previewUrl,
  };
}
