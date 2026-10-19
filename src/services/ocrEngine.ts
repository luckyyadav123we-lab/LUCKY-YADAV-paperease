import { createWorker } from 'tesseract.js';
import { jsPDF } from 'jspdf';

/**
 * Perform genuine OCR on an image file or scanned page.
 */
export async function performOCR(
  file: File,
  language: 'eng' | 'spa' | 'fra' | 'deu' = 'eng',
  onProgress?: (progress: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  onProgress?.(10, 'Initializing OCR engine...');

  const worker = await createWorker(language, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round((m.progress || 0) * 80) + 15;
        onProgress?.(pct, `Recognizing text (${Math.round((m.progress || 0) * 100)}%)...`);
      } else if (m.status) {
        onProgress?.(15, `${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
      }
    },
  });

  try {
    onProgress?.(25, 'Processing document pixels with neural OCR...');
    const result = await worker.recognize(file);
    const text = result.data.text;
    const confidence = Math.round(result.data.confidence);

    onProgress?.(95, 'Finalizing text structure...');
    await worker.terminate();

    onProgress?.(100, 'OCR completed successfully!');
    return { text, confidence };
  } catch (err: any) {
    await worker.terminate();
    throw new Error(`OCR processing error: ${err.message || 'Failed to recognize text'}`);
  }
}

/**
 * Generate a searchable/structured PDF from OCR extracted text.
 */
export async function ocrTextToPDF(
  text: string,
  title: string,
  confidence: number
): Promise<Blob> {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;

  // Header banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235); // #2563EB
  doc.text('PaperEase OCR Document Report', margin, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Source: ${title}  |  OCR Confidence: ${confidence}%  |  Engine: Neural OCR`, margin, 68);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 80, pageWidth - margin, 80);

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const lines = doc.splitTextToSize(text, maxLineWidth);
  let cursorY = 105;
  const lineHeight = 16;

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin + 20;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  return doc.output('blob');
}
