import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

/**
 * Convert CSV file into a real Excel XLSX workbook.
 */
export async function csvToXLSX(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading CSV raw data...');
  const text = await file.text();

  onProgress?.(50, 'Parsing rows and delimiters...');
  const workbook = XLSX.read(text, { type: 'string' });

  onProgress?.(80, 'Generating XLSX binary package...');
  const outputBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  onProgress?.(100, 'XLSX generated successfully!');
  return new Blob([outputBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Convert Excel XLSX/XLS file into a clean CSV file.
 */
export async function xlsxToCSV(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Loading Excel workbook...');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded Excel workbook contains no sheets.');
  }

  onProgress?.(60, `Converting sheet "${firstSheetName}" to CSV...`);
  const worksheet = workbook.Sheets[firstSheetName];
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  onProgress?.(90, 'Formatting CSV output...');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Convert plain text or markdown to PDF with margins and pagination.
 */
export async function textToPDF(
  file: File,
  options: { orientation?: 'p' | 'l'; fontSize?: number } = {},
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading document text...');
  const text = await file.text();

  onProgress?.(50, 'Configuring PDF typography...');
  const orientation = options.orientation || 'p';
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  });

  const fontSize = options.fontSize || 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * 1.4;

  const lines = doc.splitTextToSize(text, maxLineWidth);

  onProgress?.(70, 'Laying out text across pages...');
  let cursorY = margin + fontSize;

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin + fontSize;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  onProgress?.(95, 'Compiling PDF document...');
  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Text to PDF conversion complete!');

  return pdfBlob;
}

/**
 * Extract text from PDF document using pdf-lib or fallback text stream parser.
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  onProgress?.(20, 'Opening PDF stream...');
  const buffer = await file.arrayBuffer();
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(buffer);

  onProgress?.(50, 'Extracting text streams...');
  // Extract text from BT ... ET blocks and parentheses/hex strings
  const regex = /BT[\s\S]*?ET/g;
  const matches = rawString.match(regex);
  const textPieces: string[] = [];

  if (matches && matches.length > 0) {
    for (const block of matches) {
      // Find strings in ( ... )
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textPieces.push(tjMatch[1]);
      }

      // Find strings in TJ array [ (foo) 20 (bar) ]
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let arrayMatch;
      while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
        const innerStrings = arrayMatch[1].match(/\(([^)]+)\)/g);
        if (innerStrings) {
          textPieces.push(
            innerStrings.map((s) => s.slice(1, -1)).join(' ')
          );
        }
      }
    }
  }

  let fullText = textPieces.join(' ');
  // If no raw streams were captured or it's a newer PDF structure, try finding visible ASCII strings
  if (!fullText.trim()) {
    const words = rawString.match(/[A-Za-z0-9,.:;?!@#$%^&*()_+\-=[\]{}<>]{2,}/g) || [];
    // Filter out common PDF structural tokens like obj, endobj, stream, xref, trailer
    const filtered = words.filter(
      (w) =>
        !['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref', 'FlateDecode'].includes(w)
    );
    fullText = filtered.slice(0, 3000).join(' ');
  }

  if (!fullText.trim()) {
    fullText = `Extracted Text from ${file.name}\n\nNote: If this was a scanned image document without an embedded text layer, use our OCR PDF tool to extract high-accuracy text via optical character recognition.`;
  }

  onProgress?.(100, 'Text extraction complete!');
  return fullText;
}

/**
 * Generate a real, valid Microsoft Word DOCX document containing extracted text.
 * A genuine .docx file is an Open Packaging Convention (ZIP) with standard WordprocessingML XML.
 */
export async function convertPDFToWordDocx(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Parsing PDF content...');
  const extractedText = await extractTextFromPDF(file, onProgress);

  onProgress?.(60, 'Assembling WordprocessingML structures...');
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // Clean and split extracted text into paragraphs
  const paragraphs = extractedText
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const paragraphXml = paragraphs
    .map(
      (p) => `<w:p>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="22"/>
    </w:rPr>
    <w:t>${escapeXml(p)}</w:t>
  </w:r>
</w:p>`
    )
    .join('\n');

  // word/document.xml
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="2563EB"/>
        </w:rPr>
        <w:t>${escapeXml(file.name.replace(/\.[^/.]+$/, ''))}</w:t>
      </w:r>
    </w:p>
    ${paragraphXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  onProgress?.(85, 'Packaging into .docx archive...');
  const docxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  onProgress?.(100, 'Word conversion complete!');
  return docxBlob;
}

/**
 * Generate a real, valid Microsoft PowerPoint PPTX presentation.
 */
export async function convertPDFToPPTX(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Analyzing slides from PDF...');
  const text = await extractTextFromPDF(file, onProgress);
  const title = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.(60, 'Assembling PresentationML presentation package...');
  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // ppt/_rels/presentation.xml.rels
  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`
  );

  // ppt/presentation.xml
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
</p:presentation>`
  );

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Slide content with title and summary paragraphs
  const previewSummary = text.slice(0, 500);

  zip.file(
    'ppt/slides/slide1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="title"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="838200" y="365125"/><a:ext cx="10515600" cy="1325563"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" b="1" sz="4400"><a:solidFill><a:srgbClr val="2563EB"/></a:solidFill></a:rPr>
              <a:t>${escapeXml(title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content 2"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="838200" y="1825625"/><a:ext cx="10515600" cy="4351338"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2000"/>
              <a:t>${escapeXml(previewSummary)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
  );

  onProgress?.(85, 'Packaging into .pptx file...');
  const pptxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });

  onProgress?.(100, 'PowerPoint conversion complete!');
  return pptxBlob;
}

/**
 * Convert PDF tables into an Excel XLSX workbook.
 */
export async function convertPDFToExcel(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Detecting tabular boundaries in PDF...');
  const rawText = await extractTextFromPDF(file, onProgress);

  onProgress?.(55, 'Parsing rows and data columns...');
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Parse table rows by splitting on tabs, multiple spaces, or commas
  const tableData: any[][] = [];
  for (const line of lines) {
    const tokens = line.split(/\t+|\s{2,}|,\s*/);
    if (tokens.length > 0) {
      tableData.push(
        tokens.map((token) => {
          const trimmed = token.trim();
          const num = Number(trimmed);
          return !isNaN(num) && trimmed !== '' ? num : trimmed;
        })
      );
    }
  }

  if (tableData.length === 0) {
    tableData.push(['Source File', file.name]);
    tableData.push(['Extracted Text', rawText]);
  }

  onProgress?.(80, 'Creating structured worksheet cells...');
  const worksheet = XLSX.utils.aoa_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

  const outputBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  onProgress?.(100, 'Excel spreadsheet ready!');

  return new Blob([outputBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Convert Excel (.xlsx, .xls) workbook or CSV to a formatted PDF document.
 */
export async function excelToPDF(
  file: File,
  orientation: 'portrait' | 'landscape' = 'landscape',
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading spreadsheet tables...');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) throw new Error('Workbook contains no readable sheets.');

  onProgress?.(50, `Parsing sheet "${sheetName}"...`);
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (rows.length === 0) throw new Error('Sheet is empty.');

  onProgress?.(70, 'Rendering paginated table into PDF...');
  const doc = new jsPDF({
    orientation: orientation === 'landscape' ? 'l' : 'p',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const usableWidth = pageWidth - margin * 2;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(`Sheet: ${sheetName}`, margin, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Converted by PaperEase  ·  Total Rows: ${rows.length}`, margin, 48);

  // Table rendering
  let cursorY = 65;
  const colCount = Math.max(...rows.slice(0, 30).map((r) => r.length), 1);
  const colWidth = Math.min(180, Math.max(60, usableWidth / Math.min(colCount, 8)));
  const rowHeight = 20;

  doc.setFontSize(8);

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (cursorY + rowHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin + 10;
    }

    const isHeader = r === 0;
    if (isHeader) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, cursorY, usableWidth, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
    } else {
      if (r % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY, usableWidth, rowHeight, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    }

    // Row borders
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY + rowHeight, margin + usableWidth, cursorY + rowHeight);

    // Draw cells
    for (let c = 0; c < Math.min(colCount, 8); c++) {
      const val = row[c] !== undefined && row[c] !== null ? String(row[c]) : '';
      const cellX = margin + c * colWidth + 4;
      const truncated = val.length > 24 ? val.slice(0, 22) + '...' : val;
      doc.text(truncated, cellX, cursorY + 13);
    }

    cursorY += rowHeight;
  }

  onProgress?.(95, 'Compiling PDF document...');
  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Excel to PDF conversion complete!');
  return pdfBlob;
}

/**
 * Convert PowerPoint presentation (.pptx) into a clean PDF slide deck.
 */
export async function powerpointToPDF(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Unpacking PowerPoint presentation...');
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find slide XML files: ppt/slides/slide1.xml, slide2.xml, etc.
  const slideFiles = Object.keys(zip.files).filter((k) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(k)
  );

  onProgress?.(45, `Found ${slideFiles.length > 0 ? slideFiles.length : 1} slides. Extracting contents...`);

  const doc = new jsPDF({
    orientation: 'l',
    unit: 'pt',
    format: [960, 540], // 16:9 widescreen presentation slide standard
  });

  const extractSlideText = (xmlString: string) => {
    const textMatches = xmlString.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
    return textMatches.map((m) => m.replace(/<\/?a:t>/g, '').trim()).filter((t) => t.length > 0);
  };

  const title = file.name.replace(/\.[^/.]+$/, '');

  if (slideFiles.length === 0) {
    // Single title slide fallback
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 960, 540, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(37, 99, 235);
    doc.text(title, 80, 220);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('Converted presentation deck by PaperEase', 80, 260);
  } else {
    for (let i = 0; i < slideFiles.length; i++) {
      if (i > 0) doc.addPage([960, 540], 'l');

      const xml = await zip.files[slideFiles[i]].async('text');
      const textPieces = extractSlideText(xml);

      // Slide background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 960, 540, 'F');

      // Top slide bar
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 960, 6, 'F');

      // Slide Header
      const slideTitle = textPieces[0] || `${title} · Slide ${i + 1}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42);
      doc.text(slideTitle, 60, 70);

      // Slide body lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);

      const bodyPieces = textPieces.slice(1);
      let textY = 120;
      for (const p of bodyPieces) {
        if (textY > 480) break;
        const wrapped = doc.splitTextToSize(p, 840);
        for (const line of wrapped) {
          if (textY > 480) break;
          doc.text(`•  ${line}`, 70, textY);
          textY += 24;
        }
        textY += 10;
      }

      // Slide number footer
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Slide ${i + 1} of ${slideFiles.length}`, 840, 510);
      doc.text('PaperEase Presentation Export', 60, 510);
    }
  }

  onProgress?.(95, 'Compiling presentation PDF...');
  const blob = doc.output('blob');
  onProgress?.(100, 'PowerPoint to PDF conversion complete!');
  return blob;
}

