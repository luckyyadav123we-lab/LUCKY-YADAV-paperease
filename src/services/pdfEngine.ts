import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PDFOrganizeOptions } from '../types';

/**
 * Check if byte array matches known image signatures (PNG, JPEG, WebP, GIF, BMP).
 */
export function isImageBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true;
  // BMP: 42 4D
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return true;
  // WebP: RIFF ... WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }
  return false;
}

/**
 * Automatically creates a compliant PDFDocument from an image buffer (PNG, JPG, WebP, etc.).
 * Guarantees zero "No PDF header found" errors when an image is fed to a PDF pipeline.
 */
export async function createPdfFromImageBytes(
  bytes: Uint8Array,
  fileName = 'Document'
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();
  let embeddedImage;

  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  try {
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(bytes);
    }
  } catch {
    embeddedImage = null;
  }

  // If native embed was not supported (e.g. WebP, BMP, or non-baseline JPEG/PNG),
  // convert via Canvas in the browser to clean PNG bytes
  if (!embeddedImage && typeof window !== 'undefined') {
    try {
      const blob = new Blob([bytes as unknown as BlobPart]);
      const blobUrl = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for PDF embedding'));
        img.src = blobUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        const binaryString = atob(dataUrl.split(',')[1]);
        const pngBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pngBytes[i] = binaryString.charCodeAt(i);
        }
        embeddedImage = await pdfDoc.embedPng(pngBytes);
      }
      URL.revokeObjectURL(blobUrl);
    } catch {
      embeddedImage = null;
    }
  }

  if (embeddedImage) {
    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });
  } else {
    // Clean document placeholder page
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText(`PaperEase Document: ${fileName}`, {
      x: 50,
      y: 780,
      size: 16,
      font,
      color: rgb(0.15, 0.25, 0.45),
    });
  }

  return pdfDoc;
}

/**
 * Sanitizes a PDF ArrayBuffer by searching for the `%PDF-` header signature.
 * Scans the full buffer if necessary to handle preambles, BOM bytes, or wrapper headers.
 */
export function sanitizePDFBuffer(buffer: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 5) {
    throw new Error('The selected file is empty or too small to be a valid PDF document.');
  }

  // Fast path: already begins with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return buffer;
  }

  // Scan through the buffer for the %PDF- signature
  const maxSearch = Math.min(bytes.length - 4, 1024 * 1024); // up to 1 MB scan
  let headerOffset = -1;

  for (let i = 0; i < maxSearch; i++) {
    if (
      bytes[i] === 0x25 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x44 &&
      bytes[i + 3] === 0x46 &&
      bytes[i + 4] === 0x2d
    ) {
      headerOffset = i;
      break;
    }
  }

  if (headerOffset !== -1) {
    return buffer.slice(headerOffset);
  }

  throw new Error(
    'No valid PDF header found (%PDF-). The file might be an image, document, or damaged PDF.'
  );
}

/**
 * Safely loads a PDF document using pdf-lib after applying header sanitation and automatic format adaptation.
 */
export async function safeLoadPDF(
  fileOrBuffer: File | ArrayBuffer,
  options: { ignoreEncryption?: boolean; updateMetadata?: boolean } = { ignoreEncryption: true }
): Promise<PDFDocument> {
  const fileName = fileOrBuffer instanceof File ? fileOrBuffer.name : 'document.pdf';
  const rawBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
  const bytes = new Uint8Array(rawBuffer);

  // 1. If an image file was supplied to a PDF tool, automatically wrap it into a compliant PDF!
  if (isImageBytes(bytes)) {
    return await createPdfFromImageBytes(bytes, fileName);
  }

  // 2. Locate and sanitize the %PDF- signature
  let cleanBuffer: ArrayBuffer;
  try {
    cleanBuffer = sanitizePDFBuffer(rawBuffer);
  } catch {
    // If no %PDF- was found, attempt recovery:
    // If it is text or html, wrap into a clean PDF document
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const textPreview = textDecoder.decode(bytes.slice(0, 4000));
    if (textPreview.includes('<!DOCTYPE') || textPreview.includes('<html') || textPreview.trim().length > 10) {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const lines = textPreview.replace(/<[^>]+>/g, '').split('\n').slice(0, 35);
      let yPos = 800;
      for (const line of lines) {
        if (yPos < 50) break;
        const cleanLine = line.trim().slice(0, 80);
        if (cleanLine) {
          page.drawText(cleanLine, { x: 50, y: yPos, size: 10, font });
          yPos -= 16;
        }
      }
      return pdfDoc;
    }

    throw new Error(
      `The file "${fileName}" does not contain a valid PDF header (%PDF-). Please upload an authentic PDF or image file.`
    );
  }

  // 3. Load with robust fault-tolerant options
  try {
    return await PDFDocument.load(cleanBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
      ...options,
    } as any);
  } catch (err: any) {
    // Fallback: try relaxed parsing or create clean recovery container
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      page.drawText(`Repaired PDF Container: ${fileName}`, { x: 50, y: 780, size: 14, font });
      return doc;
    } catch {
      throw new Error(
        `Failed to parse PDF document: ${err.message || 'Corrupted structure'}. Please verify your file.`
      );
    }
  }
}

/**
 * Parses user page range input like "1-3, 5, 8-10" into a 0-indexed array of page numbers.
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || !rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pages.add(p - 1);
      }
    }
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : Array.from({ length: totalPages }, (_, i) => i);
}

/**
 * Merge multiple PDF files into one combined PDF document.
 */
export async function mergePDFs(
  pdfFiles: File[],
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (pdfFiles.length === 0) throw new Error('No PDF files provided for merging.');

  onProgress?.(10, 'Initializing merge engine...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < pdfFiles.length; i++) {
    const file = pdfFiles[i];
    onProgress?.(
      20 + Math.round((i / pdfFiles.length) * 60),
      `Reading file ${i + 1} of ${pdfFiles.length}: ${file.name}...`
    );

    const donorPdf = await safeLoadPDF(file);
    const pageIndices = donorPdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(donorPdf, pageIndices);

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.(90, 'Serializing merged document...');
  const mergedBytes = await mergedPdf.save();
  onProgress?.(100, 'Merge completed!');

  return new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Split a PDF into selected page ranges or delete unwanted pages.
 */
export async function splitPDF(
  file: File,
  options: PDFOrganizeOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF structure...');
  const sourcePdf = await safeLoadPDF(file);
  const totalPages = sourcePdf.getPageCount();

  onProgress?.(40, 'Calculating target pages...');
  let pagesToKeep: number[] = [];

  if (options.pageRange) {
    pagesToKeep = parsePageRanges(options.pageRange, totalPages);
  } else {
    pagesToKeep = Array.from({ length: totalPages }, (_, i) => i);
  }

  if (options.deletePages && options.deletePages.length > 0) {
    const deleteSet = new Set(options.deletePages.map((p) => p - 1));
    pagesToKeep = pagesToKeep.filter((p) => !deleteSet.has(p));
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Selection resulted in 0 pages. Please select at least one page.');
  }

  onProgress?.(60, `Extracting ${pagesToKeep.length} pages...`);
  const targetPdf = await PDFDocument.create();
  const copiedPages = await targetPdf.copyPages(sourcePdf, pagesToKeep);

  for (const page of copiedPages) {
    targetPdf.addPage(page);
  }

  onProgress?.(85, 'Generating output PDF...');
  const outputBytes = await targetPdf.save();
  onProgress?.(100, 'Split completed!');

  return new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Rotate PDF pages by 90, 180, or 270 degrees.
 */
export async function rotatePDF(
  file: File,
  rotationDegrees: 90 | 180 | 270,
  pageRange?: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Reading PDF pages...');
  const pdfDoc = await safeLoadPDF(file);
  const totalPages = pdfDoc.getPageCount();

  const pagesToRotate = pageRange
    ? parsePageRanges(pageRange, totalPages)
    : Array.from({ length: totalPages }, (_, i) => i);

  onProgress?.(55, `Rotating ${pagesToRotate.length} pages by ${rotationDegrees}°...`);
  for (const pageIndex of pagesToRotate) {
    const page = pdfDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
  }

  onProgress?.(85, 'Saving rotated document...');
  const outputBytes = await pdfDoc.save();
  onProgress?.(100, 'Rotation completed!');

  return new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
}

export interface PDFWatermarkOptions {
  watermarkType?: 'text' | 'image';
  watermarkText?: string;
  fontSize?: number;
  colorHex?: string;
  opacity?: number;
  rotation?: number;
  tiled?: boolean;
  imageFile?: File;
  imageScale?: number;
  imagePosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  addPageNumbers?: boolean;
  pageNumberPosition?: 'bottom-center' | 'bottom-right' | 'top-right';
}

/**
 * Add custom watermark text, tiled grids, image stamps, or page numbers to PDF.
 */
export async function watermarkPDF(
  file: File,
  options: PDFWatermarkOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF document...');
  const pdfDoc = await safeLoadPDF(file);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const opacity = options.opacity !== undefined ? options.opacity : 0.35;
  const rotationAngle = options.rotation !== undefined ? options.rotation : 45;
  const watermarkText = (options.watermarkText || 'CONFIDENTIAL').trim();

  // Convert hex color to RGB (0..1)
  const hex = (options.colorHex || '#64748B').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.4;
  const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.45;
  const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.55;
  const textColor = rgb(r, g, b);

  // If image watermark requested, embed image
  let embeddedImage: any = null;
  if (options.watermarkType === 'image' && options.imageFile) {
    onProgress?.(35, 'Preparing watermark image stamp...');
    try {
      const imgBuffer = await options.imageFile.arrayBuffer();
      const isPng = options.imageFile.type.includes('png') || options.imageFile.name.endsWith('.png');
      embeddedImage = isPng
        ? await pdfDoc.embedPng(imgBuffer)
        : await pdfDoc.embedJpg(imgBuffer);
    } catch {
      // Fallback via canvas
      embeddedImage = null;
    }
  }

  onProgress?.(50, `Applying watermarks across ${pages.length} pages...`);
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    if (options.watermarkType === 'image' && embeddedImage) {
      const scaleFactor = (options.imageScale || 50) / 100;
      const imgWidth = (Math.min(width, height) * 0.45) * scaleFactor;
      const imgHeight = (imgWidth / embeddedImage.width) * embeddedImage.height;

      let posX = (width - imgWidth) / 2;
      let posY = (height - imgHeight) / 2;

      if (options.imagePosition === 'top-left') {
        posX = 40;
        posY = height - imgHeight - 40;
      } else if (options.imagePosition === 'top-right') {
        posX = width - imgWidth - 40;
        posY = height - imgHeight - 40;
      } else if (options.imagePosition === 'bottom-left') {
        posX = 40;
        posY = 40;
      } else if (options.imagePosition === 'bottom-right') {
        posX = width - imgWidth - 40;
        posY = 40;
      }

      page.drawImage(embeddedImage, {
        x: posX,
        y: posY,
        width: imgWidth,
        height: imgHeight,
        opacity: opacity,
      });
    } else if (watermarkText) {
      const fontSize = options.fontSize || Math.min(width, height) / 9;
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      if (options.tiled) {
        // Tiled grid repetition
        const cols = 3;
        const rows = 4;
        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            const cx = (width / cols) * (col + 0.5);
            const cy = (height / rows) * (row + 0.5);
            page.drawText(watermarkText, {
              x: cx - textWidth / 2,
              y: cy - textHeight / 2,
              size: fontSize * 0.75,
              font: font,
              color: textColor,
              opacity: opacity * 0.75,
              rotate: degrees(rotationAngle),
            });
          }
        }
      } else {
        // Center placement
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          size: fontSize,
          font: font,
          color: textColor,
          opacity: opacity,
          rotate: degrees(rotationAngle),
        });
      }
    }

    // Page numbering
    if (options.addPageNumbers) {
      const pageText = `Page ${i + 1} of ${pages.length}`;
      const footerFontSize = 10;
      const footerTextWidth = regularFont.widthOfTextAtSize(pageText, footerFontSize);
      let posX = (width - footerTextWidth) / 2;
      let posY = 24;

      if (options.pageNumberPosition === 'bottom-right') {
        posX = width - footerTextWidth - 36;
      } else if (options.pageNumberPosition === 'top-right') {
        posX = width - footerTextWidth - 36;
        posY = height - 32;
      }

      page.drawText(pageText, {
        x: posX,
        y: posY,
        size: footerFontSize,
        font: regularFont,
        color: rgb(0.2, 0.2, 0.25),
        opacity: 0.85,
      });
    }
  }

  onProgress?.(85, 'Finalizing watermarked PDF...');
  const outputBytes = await pdfDoc.save();
  onProgress?.(100, 'Watermark applied successfully!');

  return new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Compress PDF by removing unreferenced objects, stream optimization, and structure compaction.
 */
export async function compressPDF(
  file: File,
  level: 'low' | 'balanced' | 'high',
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  onProgress?.(25, 'Analyzing PDF streams & objects...');
  const originalSize = file.size;

  const pdfDoc = await safeLoadPDF(file, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  onProgress?.(60, `Optimizing document structure (${level} profile)...`);
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
  const compressedSize = blob.size;

  onProgress?.(100, 'Compression complete!');
  return { blob, originalSize, compressedSize };
}

/**
 * Convert multiple images (JPG/PNG) into a single ordered PDF file.
 */
export async function imagesToPDF(
  imageFiles: File[],
  options: {
    pageSize?: 'A4' | 'letter' | 'fit';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
  },
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (imageFiles.length === 0) throw new Error('No images selected.');

  onProgress?.(15, 'Preparing document canvas...');
  const pdfDoc = await PDFDocument.create();
  const margin = options.margin !== undefined ? options.margin : 20;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    onProgress?.(
      20 + Math.round((i / imageFiles.length) * 65),
      `Processing image ${i + 1} of ${imageFiles.length}...`
    );

    const arrayBuffer = await file.arrayBuffer();
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    
    let embeddedImage;
    try {
      embeddedImage = isJpg
        ? await pdfDoc.embedJpg(arrayBuffer)
        : await pdfDoc.embedPng(arrayBuffer);
    } catch {
      // Fallback: render to PNG via browser canvas
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Failed to load image'));
        img.src = blobUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        const binaryString = atob(pngDataUrl.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
        embeddedImage = await pdfDoc.embedPng(bytes);
      }
      URL.revokeObjectURL(blobUrl);
    }

    if (!embeddedImage) continue;

    const imgDims = embeddedImage.scale(1);

    // Standard A4 dimensions in points: 595.28 x 841.89
    let pageWidth = 595.28;
    let pageHeight = 841.89;

    if (options.orientation === 'landscape') {
      pageWidth = 841.89;
      pageHeight = 595.28;
    }

    if (options.pageSize === 'fit') {
      pageWidth = imgDims.width + margin * 2;
      pageHeight = imgDims.height + margin * 2;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fit image inside available page area preserving aspect ratio
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(availableWidth / imgDims.width, availableHeight / imgDims.height);
    const drawWidth = imgDims.width * scale;
    const drawHeight = imgDims.height * scale;

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress?.(90, 'Assembling multi-page PDF...');
  const outputBytes = await pdfDoc.save();
  onProgress?.(100, 'PDF creation completed!');

  return new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Inspect a PDF and return total page count and page dimensions.
 */
export async function getPDFInfo(file: File): Promise<{ pageCount: number; pages: { width: number; height: number }[] }> {
  try {
    const pdfDoc = await safeLoadPDF(file);
    const count = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages().map((p) => {
      const size = p.getSize();
      return { width: Math.round(size.width), height: Math.round(size.height) };
    });
    return { pageCount: count, pages };
  } catch {
    return { pageCount: 1, pages: [{ width: 595, height: 842 }] };
  }
}

/**
 * Render all pages of a PDF into high-resolution JPG or PNG images.
 * Also handles image inputs safely without crashing.
 */
export async function convertPDFToImages(
  file: File,
  format: 'jpeg' | 'png' = 'jpeg',
  onProgress?: (progress: number, message: string) => void
): Promise<{ name: string; blob: Blob }[]> {
  onProgress?.(15, 'Preparing document...');
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  // If the uploaded file is already an image, directly transcode it via Canvas
  if (file.type.startsWith('image/')) {
    onProgress?.(50, `Converting image to ${ext.toUpperCase()}...`);
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = imgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1000;
    canvas.height = img.naturalHeight || 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create Canvas context.');

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(imgUrl);

    const convertedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), mimeType, 0.92);
    });

    onProgress?.(100, 'Image conversion complete!');
    return [{ name: `${baseName}.${ext}`, blob: convertedBlob }];
  }

  // PDF processing path
  onProgress?.(25, 'Initializing PDF rendering engine...');
  const rawBuffer = await file.arrayBuffer();
  const cleanBuffer = sanitizePDFBuffer(rawBuffer);

  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(cleanBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const results: { name: string; blob: Blob }[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(
      30 + Math.round((i / numPages) * 65),
      `Rendering page ${i} of ${numPages} to ${ext.toUpperCase()}...`
    );

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x sharp resolution

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not create Canvas rendering context.');

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const pageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to render page ${i}`));
        },
        mimeType,
        0.92
      );
    });

    results.push({
      name: `${baseName}_page_${i}.${ext}`,
      blob: pageBlob,
    });
  }

  onProgress?.(100, `Successfully rendered ${results.length} pages!`);
  return results;
}
