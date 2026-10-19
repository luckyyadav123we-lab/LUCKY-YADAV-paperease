import { ToolDefinition, ToolCategory } from '../types';

export const TOOLS: ToolDefinition[] = [
  // Popular / PDF Organization
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    category: 'organize-pdf',
    shortDescription: 'Combine multiple PDF files into one ordered document in seconds.',
    longDescription: 'Easily merge two or more PDF documents into a single consolidated file. Reorder pages, remove unwanted pages, and download your unified document with clean bookmarks and layout preservation.',
    iconName: 'Layers',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'Merge PDF Online — Combine Multiple PDFs into One | PaperEase',
    seoDescription: 'Combine multiple PDF files online for free. Fast, secure, and preserves page layout and formatting perfectly.',
    features: ['Drag-and-drop file reordering', 'Preserves hyperlinks and bookmarks', 'No page limit', 'Instant client-side processing'],
    faqs: [
      { question: 'Will my original PDF formatting be preserved?', answer: 'Yes. PaperEase preserves all vector drawings, text fonts, embedded images, and bookmarks.' },
      { question: 'Are my uploaded files kept private?', answer: 'Files are processed securely right in your local browser sandbox and are never uploaded or retained on any remote server unless cloud backup is explicitly enabled.' }
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf',
    category: 'organize-pdf',
    shortDescription: 'Extract specific page ranges or split a PDF into separate files.',
    longDescription: 'Separate one or multiple pages from your PDF file. Specify custom page ranges like 1-3, 5, 7-10 or split into individual single-page documents.',
    iconName: 'Scissors',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'Split PDF Online — Extract Page Ranges Free | PaperEase',
    seoDescription: 'Split a PDF into multiple documents or extract specific pages with custom page range syntax.',
    features: ['Custom page ranges (e.g. 1-4, 7)', 'Extract selected pages', 'Delete unwanted pages', 'Download split files or single combined selection'],
    faqs: [
      { question: 'How do I specify page ranges?', answer: 'You can type ranges like "1-3, 5, 8-10" or use our visual page selector.' }
    ]
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    slug: 'compress-pdf',
    category: 'organize-pdf',
    shortDescription: 'Reduce PDF file size while maintaining the highest visual quality.',
    longDescription: 'Downscale heavy embedded images, strip unused metadata, and optimize PDF structure. Choose between Low, Balanced, and High compression levels with live before/after size comparisons.',
    iconName: 'Minimize2',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'Compress PDF Online — Reduce PDF File Size | PaperEase',
    seoDescription: 'Compress heavy PDF files without losing readability. Three compression modes with transparent file reduction statistics.',
    features: ['3 compression profiles: Low, Balanced, High', 'Accurate file reduction percentage', 'Strips redundant document streams', 'Transparent reporting (no fake percentages)'],
    faqs: [
      { question: 'Why didn’t my PDF file shrink much?', answer: 'If your PDF already consists of highly optimized text or already compressed JPGs, additional compression may be minimal. PaperEase reports genuine byte differences.' }
    ]
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    slug: 'rotate-pdf',
    category: 'organize-pdf',
    shortDescription: 'Rotate individual pages or all pages by 90, 180, or 270 degrees.',
    longDescription: 'Fix upside-down or sideways pages in scanned documents. Rotate specific pages or all pages clockwise and counter-clockwise with a single click.',
    iconName: 'RotateCw',
    popular: false,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'Rotate PDF Online — Permanently Rotate PDF Pages | PaperEase',
    seoDescription: 'Rotate PDF pages permanently 90, 180, or 270 degrees. Works on all pages or selected pages.',
    features: ['Rotate 90°, 180°, 270°', 'Select specific pages to rotate', 'Permanent rotation saved into PDF metadata'],
    faqs: [
      { question: 'Is the rotation permanent?', answer: 'Yes, when downloaded, the new orientation is permanently embedded in the PDF page structure.' }
    ]
  },
  {
    id: 'watermark-pdf',
    name: 'Watermark PDF',
    slug: 'watermark-pdf',
    category: 'organize-pdf',
    shortDescription: 'Add custom text watermarks, confidential stamps, or page numbers.',
    longDescription: 'Protect your documents with custom text watermarks (e.g. "CONFIDENTIAL", "DRAFT", or your company name) with adjustable opacity, angle, and positioning.',
    iconName: 'Stamp',
    popular: false,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'Watermark PDF Online — Add Text & Stamp Overlays | PaperEase',
    seoDescription: 'Protect PDFs with diagonal text watermarks, custom opacity, and page numbering.',
    features: ['Custom watermark text', 'Adjustable opacity (10% to 100%)', 'Diagonal 45° angle overlay', 'Add page numbers (1 of N) to footer'],
    faqs: [
      { question: 'Can the watermark be easily removed?', answer: 'The watermark is rendered directly into the PDF content stream across all selected pages.' }
    ]
  },

  // Convert FROM PDF
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    slug: 'pdf-to-word',
    category: 'convert-from-pdf',
    shortDescription: 'Convert PDF documents into editable Microsoft Word (.docx) files.',
    longDescription: 'Extract formatted text, headers, and paragraphs from your PDF and generate an editable Word (.docx) document ready for editing in MS Word, Google Docs, or LibreOffice.',
    iconName: 'FileText',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'docx',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PDF to Word Converter Online — Convert PDF to DOCX | PaperEase',
    seoDescription: 'Convert PDF to editable Word DOCX documents online. Retains text layout, headings, and paragraph flow.',
    features: ['Generates standard .docx format', 'Preserves paragraph breaks', 'Ready for Google Docs & MS Word', 'No watermarks or limits on Pro'],
    faqs: [
      { question: 'Can I edit the converted file?', answer: 'Yes! The downloaded .docx file opens directly in Microsoft Word, LibreOffice, Pages, and Google Docs.' }
    ]
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    slug: 'pdf-to-excel',
    category: 'convert-from-pdf',
    shortDescription: 'Extract tabular data and structured text from PDF to Excel (.xlsx / .csv).',
    longDescription: 'Detect tables, rows, columns, and data grids inside PDF statements, receipts, and reports, converting them into clean spreadsheet cells in .xlsx and .csv formats.',
    iconName: 'FileSpreadsheet',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'xlsx',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PDF to Excel Converter — Extract Tables to XLSX & CSV | PaperEase',
    seoDescription: 'Extract tables, balances, and numerical datasets from PDF into genuine Excel spreadsheets.',
    features: ['Parses tabular structures', 'Outputs real multi-cell .xlsx spreadsheets', 'Export to CSV option', 'Numeric data formatted properly'],
    faqs: [
      { question: 'Does this put everything in one cell?', answer: 'No! PaperEase parses line delimiters and column tokens into distinct spreadsheet cells and rows.' }
    ]
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    slug: 'pdf-to-powerpoint',
    category: 'convert-from-pdf',
    shortDescription: 'Convert PDF presentations into PowerPoint slides (.pptx).',
    longDescription: 'Turn PDF slides and decks into Microsoft PowerPoint presentations (.pptx). Choose between visual fidelity mode (one crisp slide per page) or editable structured text mode.',
    iconName: 'Presentation',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'pptx',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PDF to PowerPoint Converter — PDF to PPTX Slides | PaperEase',
    seoDescription: 'Convert PDF slide decks into PowerPoint PPTX presentations. Preserves slide aspect ratios and graphics.',
    features: ['High-resolution 16:9 and 4:3 slide rendering', 'Generates standard .pptx files', 'Slide-per-page alignment', 'Compatible with Keynote & PowerPoint'],
    faqs: [
      { question: 'Which PowerPoint modes are supported?', answer: 'PaperEase supports high-fidelity visual slide conversion and structured text slide export.' }
    ]
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    slug: 'pdf-to-jpg',
    category: 'convert-from-pdf',
    shortDescription: 'Extract high-resolution JPG images from each page of your PDF.',
    longDescription: 'Render every page of your PDF as a crisp JPG image. Download single pages or an entire archive packaged into a convenient .ZIP file.',
    iconName: 'Image',
    popular: true,
    acceptedFormats: ['.pdf'],
    outputFormat: 'jpg',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PDF to JPG Converter Online — Extract Pages as Images | PaperEase',
    seoDescription: 'Convert PDF pages into high-resolution JPG images. Download individual images or batch ZIP archive.',
    features: ['High DPI canvas rasterization', 'Single page or batch ZIP download', 'Adjustable rendering quality', 'Color profile preservation'],
    faqs: [
      { question: 'Can I download all pages as one ZIP?', answer: 'Yes! When converting multi-page PDFs, you can download all generated JPGs in a single organized ZIP.' }
    ]
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    slug: 'pdf-to-png',
    category: 'convert-from-pdf',
    shortDescription: 'Convert PDF pages to lossless, transparent-capable PNG images.',
    longDescription: 'Export your PDF pages into lossless PNG graphics with sharp text and crisp vector rasterization, ideal for web embedding, graphic design, and print proofs.',
    iconName: 'ImageIcon',
    popular: false,
    acceptedFormats: ['.pdf'],
    outputFormat: 'png',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PDF to PNG Converter Online — Lossless Page Images | PaperEase',
    seoDescription: 'Convert PDF documents into high-resolution PNG images. Pixel-perfect rendering and ZIP batch export.',
    features: ['Lossless PNG format', 'Crisp text rendering', 'Individual or ZIP archive download'],
    faqs: [
      { question: 'Are PNGs higher quality than JPGs?', answer: 'Yes. PNG uses lossless compression, meaning no compression artifacts appear around typography.' }
    ]
  },
  {
    id: 'pdf-to-txt',
    name: 'PDF to Text',
    slug: 'pdf-to-txt',
    category: 'convert-from-pdf',
    shortDescription: 'Extract all raw and formatted plain text from PDF documents.',
    longDescription: 'Quickly strip away formatting and extract pure plain text from any PDF document into a lightweight .txt file or copy directly to clipboard.',
    iconName: 'AlignLeft',
    popular: false,
    acceptedFormats: ['.pdf'],
    outputFormat: 'txt',
    status: 'active',
    maxFiles: 10,
    seoTitle: 'PDF to Text Converter — Extract Plain Text from PDF | PaperEase',
    seoDescription: 'Extract plain text from PDF documents for notes, text analysis, and editing.',
    features: ['Preserves line breaks', 'Fast extraction', 'Instant text preview and clipboard copy', 'Download as .txt file'],
    faqs: [
      { question: 'Does this work on scanned documents without selectable text?', answer: 'For scanned documents where text is an image, use our OCR PDF tool!' }
    ]
  },

  // Convert TO PDF
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    slug: 'jpg-to-pdf',
    category: 'convert-to-pdf',
    shortDescription: 'Convert JPG photos and scans into a clean, printable PDF document.',
    longDescription: 'Turn single or multiple JPG images into a beautifully formatted PDF. Reorder photos, set page orientation (portrait/landscape), configure margins, and adjust image fit.',
    iconName: 'FileImage',
    popular: true,
    acceptedFormats: ['.jpg', '.jpeg'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 30,
    seoTitle: 'JPG to PDF Converter — Convert JPG Images to PDF Online | PaperEase',
    seoDescription: 'Convert JPG images to PDF document. Combine multiple photos into one PDF with custom page orientation.',
    features: ['Combine multiple JPGs into one PDF', 'Portrait & Landscape orientation', 'Custom margin options (None, Small, Standard)', 'Fit or fill image scaling'],
    faqs: [
      { question: 'Can I combine multiple pictures into one PDF?', answer: 'Yes! Select multiple photos, arrange their order, and download a single merged PDF.' }
    ]
  },
  {
    id: 'png-to-pdf',
    name: 'PNG to PDF',
    slug: 'png-to-pdf',
    category: 'convert-to-pdf',
    shortDescription: 'Transform PNG illustrations and screenshots into crisp PDF files.',
    longDescription: 'Convert PNG images with transparency or screenshots into professional PDF documents with clean white background rendering and exact aspect ratio maintenance.',
    iconName: 'FileUp',
    popular: true,
    acceptedFormats: ['.png'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 30,
    seoTitle: 'PNG to PDF Converter Online — Convert PNG Images to PDF | PaperEase',
    seoDescription: 'Convert PNG graphics and screenshots to high quality PDF with page size and orientation controls.',
    features: ['High-DPI preservation', 'Automatic page sizing (A4, Letter, Auto)', 'Batch multiple PNGs into one PDF'],
    faqs: [
      { question: 'What happens to transparent backgrounds?', answer: 'You can choose between a crisp white backing or preserve transparent bounds.' }
    ]
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    slug: 'word-to-pdf',
    category: 'convert-to-pdf',
    shortDescription: 'Convert Word documents (.docx, .doc, .txt) into universal PDFs.',
    longDescription: 'Transform Microsoft Word and text documents into standard PDF documents. Locks formatting, typography, and page numbers so it looks identical across all devices.',
    iconName: 'FileCode2',
    popular: true,
    acceptedFormats: ['.docx', '.txt'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 10,
    seoTitle: 'Word to PDF Converter Online — Convert DOCX to PDF | PaperEase',
    seoDescription: 'Convert DOCX documents to PDF format online. Keep layout, fonts, and styling locked across devices.',
    features: ['Direct document parsing', 'Standard A4/Letter pagination', 'Hyperlink and header support', 'Universal compatibility'],
    faqs: [
      { question: 'Will my recipient see the exact same layout?', answer: 'Yes, PDF embeds fonts and layout geometry so it renders identically on Mac, Windows, iOS, and Android.' }
    ]
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    slug: 'powerpoint-to-pdf',
    category: 'convert-to-pdf',
    shortDescription: 'Convert PowerPoint presentations (.pptx) into clean PDF slide decks.',
    longDescription: 'Convert presentations into universal PDF slide decks. Perfect for sending pitches, client proposals, and lectures without fear of missing fonts.',
    iconName: 'MonitorPlay',
    popular: true,
    acceptedFormats: ['.pptx'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'PowerPoint to PDF Converter — Convert PPTX to PDF | PaperEase',
    seoDescription: 'Convert PowerPoint PPTX slide decks into clean PDF handouts and decks.',
    features: ['Slide-by-slide conversion', 'Locks slide design and layout', 'No missing font warnings on recipient devices'],
    faqs: [
      { question: 'Can students or colleagues print my slides easily?', answer: 'Yes! PDF is the global standard for printing slides as handouts.' }
    ]
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    slug: 'excel-to-pdf',
    category: 'convert-to-pdf',
    shortDescription: 'Convert Excel spreadsheets (.xlsx, .csv) into formatted PDF tables.',
    longDescription: 'Render tables, financial sheets, and CSV datasets into clean, paginated PDF documents with styled grid headers, borders, and landscape fit.',
    iconName: 'Table2',
    popular: false,
    acceptedFormats: ['.xlsx', '.csv'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'Excel to PDF Converter — Convert XLSX & CSV to PDF | PaperEase',
    seoDescription: 'Convert Excel spreadsheets and CSV tables into beautifully formatted PDF documents.',
    features: ['Auto-fit columns', 'Landscape page orientation option', 'Clean table border rendering'],
    faqs: [
      { question: 'Does it support wide spreadsheets?', answer: 'Yes! You can choose Landscape orientation to fit wide columns neatly.' }
    ]
  },

  // Image Conversion & Compression
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'image-convert',
    shortDescription: 'Convert PNG images to compact JPG format with background color selection.',
    longDescription: 'Convert transparent or heavy PNG files into lightweight JPG images. Choose background color for transparent regions (defaults to white) and set compression quality.',
    iconName: 'RefreshCw',
    popular: true,
    acceptedFormats: ['.png'],
    outputFormat: 'jpg',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'PNG to JPG Converter Online — Fast Image Conversion | PaperEase',
    seoDescription: 'Convert PNG to JPG online for free. Custom background fill for transparent images and quality control.',
    features: ['Custom background color selector (white, black, transparent)', 'Quality slider (50% to 100%)', 'Significant file size reduction', 'Batch conversion'],
    faqs: [
      { question: 'What happens to transparent PNG pixels?', answer: 'Since JPG does not support alpha transparency, transparent areas are filled with your chosen background color (default: white).' }
    ]
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'image-convert',
    shortDescription: 'Convert JPG images into lossless PNG format with crisp clarity.',
    longDescription: 'Convert compressed JPG photos into lossless PNG format. Eliminates additional compression degradation and prepares images for graphic editing.',
    iconName: 'Repeat',
    popular: true,
    acceptedFormats: ['.jpg', '.jpeg'],
    outputFormat: 'png',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'JPG to PNG Converter Online — Convert JPG to Lossless PNG | PaperEase',
    seoDescription: 'Convert JPG to PNG format with lossless image encoding. Batch support and immediate download.',
    features: ['Lossless image output', 'No compression artifacts', 'Batch download as ZIP'],
    faqs: [
      { question: 'Will converting JPG to PNG improve its original photo quality?', answer: 'It won’t magically restore details already lost to JPG compression, but it prevents any further quality loss during editing and saving.' }
    ]
  },
  {
    id: 'png-to-webp',
    name: 'PNG to WEBP',
    slug: 'png-to-webp',
    category: 'image-convert',
    shortDescription: 'Convert PNG to ultra-light modern WEBP format with transparency intact.',
    longDescription: 'Modernize web assets by converting PNGs into Google WEBP format. Enjoy up to 80% smaller file sizes while preserving full alpha channel transparency.',
    iconName: 'Zap',
    popular: true,
    acceptedFormats: ['.png'],
    outputFormat: 'webp',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'PNG to WEBP Converter — Modern Web Format | PaperEase',
    seoDescription: 'Convert PNG to WEBP online. Keep transparency and reduce file size by up to 80% for faster web pages.',
    features: ['Preserves alpha transparency', 'Up to 80% smaller than PNG', 'Lossy or lossless WEBP options'],
    faqs: [
      { question: 'Do modern browsers support WEBP?', answer: 'Yes! All modern browsers (Chrome, Safari, Firefox, Edge) have 100% native WEBP support.' }
    ]
  },
  {
    id: 'jpg-to-webp',
    name: 'JPG to WEBP',
    slug: 'jpg-to-webp',
    category: 'image-convert',
    shortDescription: 'Compress JPG photos into efficient next-gen WEBP files.',
    longDescription: 'Convert high-resolution JPG photographs into next-gen WEBP format with superior compression efficiency and lower page load times.',
    iconName: 'Sparkles',
    popular: true,
    acceptedFormats: ['.jpg', '.jpeg'],
    outputFormat: 'webp',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'JPG to WEBP Converter Online — Next-Gen Image Compression | PaperEase',
    seoDescription: 'Convert JPG photos to WEBP for faster website performance and lighter bandwidth usage.',
    features: ['Smaller file size than JPG at same visual quality', 'Quality slider', 'Batch conversion support'],
    faqs: [
      { question: 'How much space will I save?', answer: 'Typically 25% to 45% smaller than the equivalent quality JPG.' }
    ]
  },
  {
    id: 'compress-image',
    name: 'Image Compressor',
    slug: 'compress-image',
    category: 'image-edit',
    shortDescription: 'Compress JPG, PNG, and WEBP files with interactive quality control.',
    longDescription: 'Shrink image file sizes without noticeable loss in visual quality. Adjust quality sliders, downscale max dimensions, and review real before/after file sizes.',
    iconName: 'Shrink',
    popular: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'original',
    status: 'active',
    maxFiles: 20,
    seoTitle: 'Image Compressor Online — Compress JPG, PNG, WEBP | PaperEase',
    seoDescription: 'Reduce image file size with fine-grained quality controls and real-time size reduction statistics.',
    features: ['Real-time reduction percentage', 'Quality slider (10% to 100%)', 'Max dimension resizing limit (e.g. 1920px)', 'Batch compression to ZIP'],
    faqs: [
      { question: 'Does compression alter image dimensions?', answer: 'Only if you specify a maximum width/height constraint; otherwise pixel dimensions remain untouched.' }
    ]
  },
  {
    id: 'resize-image',
    name: 'Resize Image',
    slug: 'resize-image',
    category: 'image-edit',
    shortDescription: 'Resize photos by exact pixel dimensions or percentage with aspect lock.',
    longDescription: 'Change image dimensions by specifying exact pixel width and height or a percentage scaling factor. Maintain aspect ratio to prevent distortion.',
    iconName: 'Maximize2',
    popular: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'original',
    status: 'active',
    maxFiles: 10,
    seoTitle: 'Resize Image Online — Resize Pixels or Percentage | PaperEase',
    seoDescription: 'Resize images by width, height, or percentage while maintaining aspect ratio.',
    features: ['Pixel or percentage mode', 'Aspect ratio lock toggle', 'Rotate and flip options', 'Bilinear smooth interpolation'],
    faqs: [
      { question: 'How do I maintain aspect ratio?', answer: 'Keep the aspect ratio lock checked, and entering a new width will automatically calculate the matching height.' }
    ]
  },
  {
    id: 'edit-image',
    name: 'Image Editor & Effects',
    slug: 'edit-image',
    category: 'image-edit',
    shortDescription: 'Adjust brightness, contrast, grayscale, rotation, and watermarks.',
    longDescription: 'Fine-tune images with instant adjustments: brightness, contrast, black & white / grayscale, horizontal and vertical flip, and text watermarking.',
    iconName: 'Sliders',
    popular: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormat: 'original',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'Free Online Image Editor — Brightness, Grayscale & Rotate | PaperEase',
    seoDescription: 'Quickly adjust image brightness, contrast, rotation, and add watermarks in your browser.',
    features: ['Brightness & Contrast sliders', 'Grayscale toggle', 'Flip horizontal / vertical', 'Custom text watermark overlay'],
    faqs: [
      { question: 'Is my photo uploaded to a server?', answer: 'No! All pixel manipulation happens securely within your browser canvas.' }
    ]
  },

  // OCR & Document Intelligence
  {
    id: 'ocr-pdf',
    name: 'OCR & Scanned PDF',
    slug: 'ocr-pdf',
    category: 'ocr-security',
    shortDescription: 'Extract text from scanned PDFs and images using optical character recognition.',
    longDescription: 'Powered by in-browser Tesseract OCR engine! Turn scanned paper documents, receipts, and photos into copyable text and downloadable text files.',
    iconName: 'ScanText',
    popular: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    outputFormat: 'txt',
    status: 'active',
    maxFiles: 5,
    seoTitle: 'OCR PDF Online — Extract Text from Scans and Images | PaperEase',
    seoDescription: 'Recognize text from scanned PDF documents and images using in-browser OCR with multi-language support.',
    features: ['In-browser OCR engine', 'Multi-language support (English, Spanish, French, German)', 'Real-time progress percentage', 'Copy text to clipboard or download TXT'],
    faqs: [
      { question: 'Which languages are supported?', answer: 'English, Spanish, French, and German are fully supported.' },
      { question: 'Does OCR require good scan quality?', answer: 'Higher resolution scans (300 DPI or clear mobile photos) produce the highest recognition accuracy.' }
    ]
  },
  {
    id: 'csv-to-xlsx',
    name: 'CSV to Excel',
    slug: 'csv-to-xlsx',
    category: 'ocr-security',
    shortDescription: 'Convert plain CSV datasets into formatted Excel XLSX spreadsheets.',
    longDescription: 'Turn comma-separated values (CSV) into genuine Microsoft Excel (.xlsx) workbooks with properly recognized numbers, dates, and column styling.',
    iconName: 'FileSpreadsheet',
    popular: false,
    acceptedFormats: ['.csv'],
    outputFormat: 'xlsx',
    status: 'active',
    maxFiles: 10,
    seoTitle: 'CSV to Excel Converter — Convert CSV to XLSX Online | PaperEase',
    seoDescription: 'Convert CSV files to Microsoft Excel XLSX format with preserved column headers and numeric formats.',
    features: ['Auto delimiter detection (comma, semicolon, tab)', 'Numeric parsing', 'Immediate XLSX download'],
    faqs: [
      { question: 'Does this handle commas inside quoted strings?', answer: 'Yes! Standard RFC-4180 CSV escaping and quotation marks are fully respected.' }
    ]
  },
  {
    id: 'xlsx-to-csv',
    name: 'Excel to CSV',
    slug: 'xlsx-to-csv',
    category: 'ocr-security',
    shortDescription: 'Convert Excel workbooks (.xlsx, .xls) to clean, portable CSV files.',
    longDescription: 'Export spreadsheet sheets from Microsoft Excel workbooks into lightweight, universal CSV files ready for database imports and code pipelines.',
    iconName: 'FileText',
    popular: false,
    acceptedFormats: ['.xlsx', '.xls'],
    outputFormat: 'csv',
    status: 'active',
    maxFiles: 10,
    seoTitle: 'Excel to CSV Converter Online — Export XLSX to CSV | PaperEase',
    seoDescription: 'Export Excel spreadsheet sheets to CSV format online. Clean row delimiters and quick download.',
    features: ['Select sheet to export', 'Standard comma-delimited output', 'No formulas corrupting raw data'],
    faqs: [
      { question: 'Which sheet is converted?', answer: 'By default the primary active sheet is converted into standard CSV.' }
    ]
  },
  // AI Document Intelligence (Gemini 3.8 Flash)
  {
    id: 'ai-summarizer',
    name: 'AI PDF Summarizer',
    slug: 'ai-summarizer',
    category: 'ai-assistant',
    shortDescription: 'Generate executive summaries, key takeaways, and action items in seconds.',
    longDescription: 'Extract core insights from lengthy PDFs, reports, and research papers. Choose between Quick Executive Brief, Balanced Highlights, or Comprehensive Deep Dive with structured bullet points and instant exports.',
    iconName: 'Sparkles',
    popular: true,
    acceptedFormats: ['.pdf', '.docx', '.txt'],
    outputFormat: 'pdf',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'AI PDF Summarizer — Summarize Documents Online with Gemini | PaperEase',
    seoDescription: 'Summarize PDFs and documents in seconds with AI. Get executive summaries, key bullet points, and export to PDF or Word.',
    features: ['Executive summary & key takeaways', '3 length profiles: Brief, Balanced, Deep Dive', 'Focus modes: Action Items, Metrics, General', 'Export summary to PDF or DOCX'],
    faqs: [
      { question: 'What models power the summarizer?', answer: 'PaperEase uses Google Gemini 3.8 Flash for fast, accurate contextual document analysis.' },
      { question: 'Can I export the summary?', answer: 'Yes! You can copy with one click, or export the generated summary directly as a PDF or Word document.' }
    ]
  },
  {
    id: 'chat-pdf',
    name: 'Chat with PDF',
    slug: 'chat-pdf',
    category: 'ai-assistant',
    shortDescription: 'Ask questions, extract facts, and converse with any PDF document in real time.',
    longDescription: 'Turn any PDF into an interactive AI dialogue. Ask questions, get exact citations, explore complex clauses, and receive intelligent follow-up suggestions powered by Gemini 3.8 Flash.',
    iconName: 'MessageSquare',
    popular: true,
    acceptedFormats: ['.pdf', '.docx', '.txt'],
    outputFormat: 'txt',
    status: 'active',
    maxFiles: 1,
    seoTitle: 'Chat with PDF Online — Conversational AI Document Assistant | PaperEase',
    seoDescription: 'Chat with your PDF documents online. Ask questions, extract answers with citations, and explore research papers effortlessly.',
    features: ['Interactive multi-turn conversation', 'Clickable starter question suggestions', 'Exact quotes and citations', 'Export chat transcript'],
    faqs: [
      { question: 'Does the AI hallucinate external facts?', answer: 'No. The assistant is instructed to ground its answers strictly in your uploaded document context.' },
      { question: 'What document formats are supported?', answer: 'You can chat with PDF files, Word DOCX documents, and plain text TXT files.' }
    ]
  }
];

export const CATEGORIES: { id: ToolCategory; label: string; description: string }[] = [
  { id: 'ai-assistant', label: 'AI Intelligence', description: 'AI Summarizer, Chat with PDF, and document intelligence powered by Gemini.' },
  { id: 'organize-pdf', label: 'Organize PDF', description: 'Merge, split, rotate, watermark, and compress PDF documents.' },
  { id: 'convert-from-pdf', label: 'Convert from PDF', description: 'Transform PDFs into Word, Excel, PowerPoint, JPG, and PNG.' },
  { id: 'convert-to-pdf', label: 'Convert to PDF', description: 'Convert Word, Excel, PowerPoint, and images into PDFs.' },
  { id: 'image-convert', label: 'Image Converters', description: 'Convert between PNG, JPG, WEBP, and modern image formats.' },
  { id: 'image-edit', label: 'Image Optimizers', description: 'Compress, resize, crop, filter, and adjust photos.' },
  { id: 'ocr-security', label: 'OCR & Data', description: 'Optical character recognition, CSV to Excel, and table extraction.' },
];
