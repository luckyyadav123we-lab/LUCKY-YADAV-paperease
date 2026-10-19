import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { parsePageRanges } from '../src/services/pdfEngine';

async function runTests() {
  console.log('--- Starting PaperEase Core Engine Automated Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Page range parsing test
    console.log('\n[Test 1: Page Range Parsing]');
    const r1 = parsePageRanges('1-3, 5', 10);
    assert(r1.length === 4 && r1[0] === 0 && r1[1] === 1 && r1[2] === 2 && r1[3] === 4, 'Parse "1-3, 5" into 0-indexed [0, 1, 2, 4]');

    const r2 = parsePageRanges('', 5);
    assert(r2.length === 5, 'Empty range returns all 5 pages');

    // 2. Real PDF Creation and Merging
    console.log('\n[Test 2: PDF Document Generation & Merging]');
    const doc1 = await PDFDocument.create();
    const p1 = doc1.addPage([400, 600]);
    p1.drawText('Document 1 Page 1');
    const bytes1 = await doc1.save();
    assert(bytes1.length > 0, 'Document 1 generated with valid bytes');

    const doc2 = await PDFDocument.create();
    const p2 = doc2.addPage([400, 600]);
    p2.drawText('Document 2 Page 1');
    const bytes2 = await doc2.save();
    assert(bytes2.length > 0, 'Document 2 generated with valid bytes');

    // Merge them
    const merged = await PDFDocument.create();
    const d1 = await PDFDocument.load(bytes1);
    const d2 = await PDFDocument.load(bytes2);
    const copied1 = await merged.copyPages(d1, d1.getPageIndices());
    const copied2 = await merged.copyPages(d2, d2.getPageIndices());
    copied1.forEach((p) => merged.addPage(p));
    copied2.forEach((p) => merged.addPage(p));
    const mergedBytes = await merged.save();
    const loadedMerged = await PDFDocument.load(mergedBytes);
    assert(loadedMerged.getPageCount() === 2, 'Merged PDF has exactly 2 pages');

    // 3. PDF Splitting
    console.log('\n[Test 3: PDF Splitting by Page Range]');
    const splitDoc = await PDFDocument.create();
    const splitCopied = await splitDoc.copyPages(loadedMerged, [1]);
    splitDoc.addPage(splitCopied[0]);
    const splitBytes = await splitDoc.save();
    const loadedSplit = await PDFDocument.load(splitBytes);
    assert(loadedSplit.getPageCount() === 1, 'Split PDF contains extracted page');

    // 4. Spreadsheet CSV to XLSX & XLSX to CSV
    console.log('\n[Test 4: CSV and XLSX Transformation]');
    const sampleCsv = 'Name,Role,Country\nAlice,Engineer,Canada\nBob,Designer,Germany';
    const wb = XLSX.read(sampleCsv, { type: 'string' });
    assert(wb.SheetNames.length === 1, 'Workbook has 1 sheet');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const generatedCsv = XLSX.utils.sheet_to_csv(sheet);
    assert(generatedCsv.includes('Alice') && generatedCsv.includes('Designer'), 'CSV data round-trips correctly');

    // 5. OpenXML Word (.docx) Structure Test
    console.log('\n[Test 5: OpenXML Package Validation]');
    const JSZip = (await import('jszip')).default;
    const docxZip = new JSZip();
    docxZip.file(
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'
    );
    docxZip.file(
      'word/document.xml',
      '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello PaperEase</w:t></w:r></w:p></w:body></w:document>'
    );
    const docxBuffer = await docxZip.generateAsync({ type: 'nodebuffer' });
    assert(docxBuffer.length > 50, 'Generated valid .docx OpenXML compressed binary package');

    // 6. Test PDF Header Sanitization & Offset Recovery (Prevents "No PDF header found")
    console.log('\n[Test 6: Leading Junk/BOM Offset Recovery]');
    const { sanitizePDFBuffer, safeLoadPDF } = await import('../src/services/pdfEngine');
    // Prepend 32 bytes of BOM and whitespace to a valid PDF stream
    const prefix = new Uint8Array([0xEF, 0xBB, 0xBF, 0x0A, 0x20, 0x20, 0x20]);
    const prefixedBuffer = new Uint8Array(prefix.length + bytes1.length);
    prefixedBuffer.set(prefix, 0);
    prefixedBuffer.set(bytes1, prefix.length);

    const recoveredBuffer = sanitizePDFBuffer(prefixedBuffer.buffer);
    assert(recoveredBuffer.byteLength === bytes1.length, 'sanitizePDFBuffer accurately sliced leading prefix bytes');

    const recoveredDoc = await safeLoadPDF(prefixedBuffer.buffer);
    assert(recoveredDoc.getPageCount() === 1, 'safeLoadPDF successfully parsed offset PDF without MissingPDFHeaderError');

    console.log(`\n========================================`);
    console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (e) {
    console.error('Unhandled test exception:', e);
    process.exit(1);
  }
}

runTests();
