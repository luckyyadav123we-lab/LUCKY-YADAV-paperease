import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ToolDefinition } from '../types';
import { formatBytes, downloadBlob, downloadZipArchive } from '../services/zipService';
import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  watermarkPDF,
  compressPDF,
  imagesToPDF,
  getPDFInfo,
  convertPDFToImages,
} from '../services/pdfEngine';
import { processImage, getImageMetadata } from '../services/imageEngine';
import {
  csvToXLSX,
  xlsxToCSV,
  textToPDF,
  convertPDFToWordDocx,
  convertPDFToPPTX,
  convertPDFToExcel,
  extractTextFromPDF,
  excelToPDF,
  powerpointToPDF,
} from '../services/documentEngine';
import { performOCR, ocrTextToPDF } from '../services/ocrEngine';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Download,
  RotateCcw,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  presetFile?: File | null;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, presetFile }) => {
  const { navigateTo, user, recordOperation, addJob, showToast } = useApp();

  // Selected files
  const [files, setFiles] = useState<File[]>(presetFile ? [presetFile] : []);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [pdfMeta, setPdfMeta] = useState<{ pageCount: number } | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [originalTotalSize, setOriginalTotalSize] = useState<number | null>(null);
  const [extractedOcrText, setExtractedOcrText] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<{ name: string; blob: Blob }[]>([]);

  // Settings per tool category
  // PDF Organize settings
  const [pageRange, setPageRange] = useState('');
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right'>('bottom-center');
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'balanced' | 'high'>('balanced');

  // Image Settings
  const [imageQuality, setImageQuality] = useState(85);
  const [imageBgColor, setImageBgColor] = useState('#FFFFFF');
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [naturalAspect, setNaturalAspect] = useState(1);
  const [imgGrayscale, setImgGrayscale] = useState(false);
  const [imgBrightness, setImgBrightness] = useState(0);
  const [imgContrast, setImgContrast] = useState(0);

  // Document & OCR settings
  const [ocrLanguage, setOcrLanguage] = useState<'eng' | 'spa' | 'fra' | 'deu'>('eng');
  const [pageSize, setPageSize] = useState<'A4' | 'fit'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preset file or inspect PDF info
  useEffect(() => {
    if (presetFile && files.length === 0) {
      setFiles([presetFile]);
    }
  }, [presetFile]);

  // Inspect first file for metadata/previews
  useEffect(() => {
    if (files.length === 0) {
      setPdfMeta(null);
      setFilePreviews([]);
      return;
    }

    const first = files[0];
    if (first.name.toLowerCase().endsWith('.pdf') || first.type === 'application/pdf') {
      getPDFInfo(first)
        .then((info) => setPdfMeta(info))
        .catch(() => setPdfMeta(null));
    }

    // Generate previews for images
    const urls = files
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);

    if (files[0].type.startsWith('image/')) {
      getImageMetadata(files[0])
        .then((m) => {
          setResizeWidth(m.width);
          setResizeHeight(m.height);
          setNaturalAspect(m.width / m.height);
        })
        .catch(() => {});
    }

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  // Handle aspect ratio changes
  const handleWidthChange = (val: number | '') => {
    setResizeWidth(val);
    if (maintainAspect && typeof val === 'number' && naturalAspect > 0) {
      setResizeHeight(Math.round(val / naturalAspect));
    }
  };

  const handleHeightChange = (val: number | '') => {
    setResizeHeight(val);
    if (maintainAspect && typeof val === 'number' && naturalAspect > 0) {
      setResizeWidth(Math.round(val * naturalAspect));
    }
  };

  // Add files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    // Validate size
    const maxBytes = user.maxFileSizeMB * 1024 * 1024;
    for (const f of incoming) {
      if (f.size > maxBytes) {
        showToast(
          `File "${f.name}" exceeds your plan limit of ${user.maxFileSizeMB} MB. Please upgrade to Pro.`,
          'error'
        );
        return;
      }
    }

    if (tool.maxFiles === 1) {
      setFiles([incoming[0]]);
    } else {
      setFiles((prev) => [...prev, ...incoming].slice(0, tool.maxFiles));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const arr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      const temp = arr[index];
      arr[index] = arr[target];
      arr[target] = temp;
      return arr;
    });
  };

  // EXECUTE REAL CONVERSION
  const handleExecute = async () => {
    if (files.length === 0) return;

    // Check usage quota
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    if (!recordOperation(totalBytes)) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Starting conversion pipeline...');
    setError(null);
    setResultBlob(null);
    setExtractedOcrText(null);
    setBatchResults([]);
    setOriginalTotalSize(totalBytes);

    const baseName = files[0].name.replace(/\.[^/.]+$/, '');

    try {
      let outputBlob: Blob;
      let outputFileName = '';

      switch (tool.id) {
        case 'merge-pdf': {
          outputBlob = await mergePDFs(files, (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}_merged.pdf`;
          break;
        }

        case 'split-pdf': {
          outputBlob = await splitPDF(
            files[0],
            { pageRange: pageRange.trim() },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputFileName = `${baseName}_split.pdf`;
          break;
        }

        case 'rotate-pdf': {
          outputBlob = await rotatePDF(
            files[0],
            rotationDegrees,
            pageRange.trim() || undefined,
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputFileName = `${baseName}_rotated.pdf`;
          break;
        }

        case 'watermark-pdf': {
          outputBlob = await watermarkPDF(
            files[0],
            {
              watermarkText,
              opacity: watermarkOpacity,
              addPageNumbers,
              pageNumberPosition,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputFileName = `${baseName}_watermarked.pdf`;
          break;
        }

        case 'compress-pdf': {
          const res = await compressPDF(files[0], compressionLevel, (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputBlob = res.blob;
          outputFileName = `${baseName}_compressed.pdf`;
          break;
        }

        case 'jpg-to-pdf':
        case 'png-to-pdf': {
          outputBlob = await imagesToPDF(
            files,
            {
              pageSize,
              orientation,
              margin: 20,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputFileName = `${baseName}.pdf`;
          break;
        }

        case 'pdf-to-word': {
          outputBlob = await convertPDFToWordDocx(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.docx`;
          break;
        }

        case 'pdf-to-powerpoint': {
          outputBlob = await convertPDFToPPTX(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.pptx`;
          break;
        }

        case 'pdf-to-excel': {
          outputBlob = await convertPDFToExcel(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.xlsx`;
          break;
        }

        case 'pdf-to-txt': {
          const text = await extractTextFromPDF(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          outputFileName = `${baseName}.txt`;
          setExtractedOcrText(text);
          break;
        }

        case 'png-to-jpg': {
          const res = await processImage(
            files[0],
            {
              targetFormat: 'jpeg',
              quality: imageQuality / 100,
              backgroundColorForTransparency: imageBgColor,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}.jpg`;
          break;
        }

        case 'jpg-to-png': {
          const res = await processImage(
            files[0],
            {
              targetFormat: 'png',
              quality: 1,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}.png`;
          break;
        }

        case 'png-to-webp':
        case 'jpg-to-webp': {
          const res = await processImage(
            files[0],
            {
              targetFormat: 'webp',
              quality: imageQuality / 100,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}.webp`;
          break;
        }

        case 'compress-image': {
          const res = await processImage(
            files[0],
            {
              targetFormat: files[0].type.includes('png') ? 'png' : 'jpeg',
              quality: imageQuality / 100,
              maxWidth: resizeWidth ? Number(resizeWidth) : undefined,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}_optimized.${files[0].type.includes('png') ? 'png' : 'jpg'}`;
          break;
        }

        case 'resize-image': {
          const res = await processImage(
            files[0],
            {
              targetFormat: files[0].type.includes('png') ? 'png' : 'jpeg',
              quality: 0.9,
              maxWidth: resizeWidth ? Number(resizeWidth) : undefined,
              maxHeight: resizeHeight ? Number(resizeHeight) : undefined,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}_${res.width}x${res.height}.${files[0].type.includes('png') ? 'png' : 'jpg'}`;
          break;
        }

        case 'edit-image': {
          const res = await processImage(
            files[0],
            {
              targetFormat: files[0].type.includes('png') ? 'png' : 'jpeg',
              quality: 0.9,
              grayscale: imgGrayscale,
              brightness: imgBrightness,
              contrast: imgContrast,
              rotate: rotationDegrees,
              watermarkText: watermarkText.trim() || undefined,
            },
            (pct, msg) => {
              setProgress(pct);
              setStatusMessage(msg);
            }
          );
          outputBlob = res.blob;
          outputFileName = `${baseName}_edited.${files[0].type.includes('png') ? 'png' : 'jpg'}`;
          break;
        }

        case 'ocr-pdf': {
          const ocrRes = await performOCR(files[0], ocrLanguage, (pct, status) => {
            setProgress(pct);
            setStatusMessage(status);
          });

          setExtractedOcrText(ocrRes.text);
          outputBlob = await ocrTextToPDF(ocrRes.text, files[0].name, ocrRes.confidence);
          outputFileName = `${baseName}_ocr.pdf`;
          break;
        }

        case 'csv-to-xlsx': {
          outputBlob = await csvToXLSX(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.xlsx`;
          break;
        }

        case 'xlsx-to-csv': {
          outputBlob = await xlsxToCSV(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.csv`;
          break;
        }

        case 'word-to-pdf': {
          outputBlob = await textToPDF(files[0], { orientation: 'p', fontSize: 11 }, (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.pdf`;
          break;
        }

        case 'pdf-to-jpg': {
          const pageImages = await convertPDFToImages(files[0], 'jpeg', (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          if (pageImages.length === 1) {
            outputBlob = pageImages[0].blob;
            outputFileName = pageImages[0].name;
          } else {
            outputBlob = await downloadZipArchive(pageImages, `${baseName}_jpg_pages.zip`);
            outputFileName = `${baseName}_jpg_pages.zip`;
          }
          setBatchResults(pageImages);
          break;
        }

        case 'pdf-to-png': {
          const pageImages = await convertPDFToImages(files[0], 'png', (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          if (pageImages.length === 1) {
            outputBlob = pageImages[0].blob;
            outputFileName = pageImages[0].name;
          } else {
            outputBlob = await downloadZipArchive(pageImages, `${baseName}_png_pages.zip`);
            outputFileName = `${baseName}_png_pages.zip`;
          }
          setBatchResults(pageImages);
          break;
        }

        case 'powerpoint-to-pdf': {
          outputBlob = await powerpointToPDF(files[0], (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.pdf`;
          break;
        }

        case 'excel-to-pdf': {
          outputBlob = await excelToPDF(files[0], orientation, (pct, msg) => {
            setProgress(pct);
            setStatusMessage(msg);
          });
          outputFileName = `${baseName}.pdf`;
          break;
        }

        default: {
          throw new Error(`Tool "${tool.name}" operation failed.`);
        }
      }

      setResultBlob(outputBlob);
      setResultFileName(outputFileName);
      setResultSize(outputBlob.size);
      setIsProcessing(false);
      setProgress(100);

      // Record in job history
      addJob({
        id: 'job_' + Math.random().toString(36).substring(2, 9),
        toolId: tool.id,
        toolName: tool.name,
        inputFileName: files[0].name,
        inputFileSize: totalBytes,
        outputFileName,
        outputFileSize: outputBlob.size,
        status: 'completed',
        progress: 100,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      showToast(`Conversion complete! Your file "${outputFileName}" is ready.`, 'success');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setError(err.message || 'An unexpected error occurred during processing.');
      showToast('Processing failed. ' + (err.message || ''), 'error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, resultFileName);
  };

  const handleReset = () => {
    setFiles([]);
    setResultBlob(null);
    setResultFileName('');
    setResultSize(null);
    setError(null);
    setProgress(0);
    setExtractedOcrText(null);
  };

  const copyExtractedText = () => {
    if (extractedOcrText) {
      navigator.clipboard.writeText(extractedOcrText);
      showToast('Extracted text copied to clipboard!', 'success');
    }
  };

  // Percentage difference
  const sizeReduction =
    originalTotalSize && resultSize && originalTotalSize > resultSize
      ? Math.round(((originalTotalSize - resultSize) / originalTotalSize) * 100)
      : 0;

  return (
    <div className="py-8 md:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Tools</span>
        </button>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="capitalize">{tool.category.replace('-', ' ')}</span>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">{tool.name}</span>
      </div>

      {/* Tool Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
          {tool.longDescription}
        </p>

        {/* Unboxed Metadata line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-3 font-mono">
          <span>Accepts: {tool.acceptedFormats.join(', ')}</span>
          <span aria-hidden="true">·</span>
          <span>Output: .{tool.outputFormat}</span>
          <span aria-hidden="true">·</span>
          <span>Max file size: {user.maxFileSizeMB} MB</span>
        </div>
      </div>

      {/* Main Workspace Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Step 1: Upload Dropzone if no files selected */}
        {files.length === 0 && !resultBlob && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/40"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={tool.acceptedFormats.join(',')}
              multiple={tool.maxFiles > 1}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Select {tool.maxFiles > 1 ? 'files' : 'a file'} to {tool.name.toLowerCase()}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Supported formats: {tool.acceptedFormats.join(', ')}. Drag and drop here or click to browse.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Choose {tool.maxFiles > 1 ? 'Files' : 'File'}</span>
            </button>
          </div>
        )}

        {/* Step 2: Files Loaded & Settings */}
        {files.length > 0 && !resultBlob && (
          <div className="space-y-6">
            {/* File List / Queue */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Uploaded {files.length > 1 ? `Files (${files.length})` : 'File'}
                </span>
                {tool.maxFiles > 1 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    + Add More Files
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={tool.acceptedFormats.join(',')}
                  multiple={tool.maxFiles > 1}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-slate-900 truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {formatBytes(file.size)}
                          {pdfMeta && ` · ${pdfMeta.pageCount} pages`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {tool.id === 'merge-pdf' && files.length > 1 && (
                        <>
                          <button
                            onClick={() => moveFile(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveFile(idx, 'down')}
                            disabled={idx === files.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Settings Area based on tool */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Conversion Settings</span>
              </h4>

              {/* Merge PDF settings */}
              {tool.id === 'merge-pdf' && (
                <p className="text-xs text-slate-500">
                  Files will be merged in the exact order shown above. Use the arrows to rearrange file priority.
                </p>
              )}

              {/* Split PDF settings */}
              {tool.id === 'split-pdf' && (
                <div className="max-w-md space-y-2">
                  <label className="block text-xs font-medium text-slate-700">
                    Extract Page Ranges (leave empty to extract all)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5, 8-10"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Total pages detected: {pdfMeta ? pdfMeta.pageCount : 'Detecting...'}
                  </p>
                </div>
              )}

              {/* Rotate PDF settings */}
              {tool.id === 'rotate-pdf' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Rotation Angle
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotationDegrees(deg as any)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                            rotationDegrees === deg
                              ? 'bg-blue-50 text-blue-700 border-blue-400'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {deg}° Clockwise
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Apply to Specific Pages (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 3-5 (blank for all pages)"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Watermark PDF settings */}
              {tool.id === 'watermark-pdf' && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Opacity: {Math.round(watermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="addPageNum"
                      checked={addPageNumbers}
                      onChange={(e) => setAddPageNumbers(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="addPageNum" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Also include footer page numbers (Page 1 of N)
                    </label>
                  </div>
                </div>
              )}

              {/* Compress PDF settings */}
              {tool.id === 'compress-pdf' && (
                <div className="space-y-3 max-w-md">
                  <label className="block text-xs font-medium text-slate-700">
                    Compression Profile
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Low', desc: 'Highest quality' },
                      { id: 'balanced', label: 'Balanced', desc: 'Standard' },
                      { id: 'high', label: 'High', desc: 'Smallest file' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCompressionLevel(lvl.id as any)}
                        className={`p-2.5 text-center rounded-xl border transition-colors cursor-pointer ${
                          compressionLevel === lvl.id
                            ? 'bg-blue-50 border-blue-400 text-blue-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold text-xs">{lvl.label}</div>
                        <div className="text-[10px] text-slate-400">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Quality & Transparency settings */}
              {(tool.id === 'png-to-jpg' || tool.id === 'compress-image' || tool.id === 'jpg-to-webp') && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Quality: {imageQuality}%</span>
                      <span className="text-slate-400">
                        {imageQuality > 80 ? 'Crisp' : imageQuality > 50 ? 'Balanced' : 'High Compression'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={imageQuality}
                      onChange={(e) => setImageQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {tool.id === 'png-to-jpg' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Transparency Replacement Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={imageBgColor}
                          onChange={(e) => setImageBgColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs text-slate-500 font-mono">{imageBgColor}</span>
                        <button
                          type="button"
                          onClick={() => setImageBgColor('#FFFFFF')}
                          className="text-xs text-blue-600 hover:underline ml-2 cursor-pointer"
                        >
                          Reset to White
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resize image settings */}
              {tool.id === 'resize-image' && (
                <div className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => handleWidthChange(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={resizeHeight}
                        onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maintainAspect"
                      checked={maintainAspect}
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="maintainAspect" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Lock aspect ratio
                    </label>
                  </div>
                </div>
              )}

              {/* Edit image effects */}
              {tool.id === 'edit-image' && (
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="grayscale"
                      checked={imgGrayscale}
                      onChange={(e) => setImgGrayscale(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="grayscale" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Convert to Grayscale (Black & White)
                    </label>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Brightness: {imgBrightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={imgBrightness}
                      onChange={(e) => setImgBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Contrast: {imgContrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={imgContrast}
                      onChange={(e) => setImgContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* OCR language setting */}
              {tool.id === 'ocr-pdf' && (
                <div className="space-y-2 max-w-md">
                  <label className="block text-xs font-medium text-slate-700">
                    Document Recognition Language
                  </label>
                  <select
                    value={ocrLanguage}
                    onChange={(e) => setOcrLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="eng">English</option>
                    <option value="spa">Spanish (Español)</option>
                    <option value="fra">French (Français)</option>
                    <option value="deu">German (Deutsch)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Tesseract neural OCR runs privately in your browser with zero server data transfer.
                  </p>
                </div>
              )}

              {/* Images to PDF settings */}
              {(tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') && (
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Page Size</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="A4">Standard A4</option>
                      <option value="fit">Fit to Image Size</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Orientation</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Conversion Progress Bar */}
            {isProcessing && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>{statusMessage || 'Processing file...'}</span>
                  </span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={handleExecute}
                disabled={isProcessing}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Processing...' : `Convert to ${tool.outputFormat.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result Ready & Download */}
        {resultBlob && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Your file is ready for download!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Processed with 100% genuine byte output and local privacy preservation.
              </p>
            </div>

            {/* Before vs After stats card */}
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Output filename:</span>
                <span className="font-semibold text-slate-900 font-mono truncate max-w-[200px]">
                  {resultFileName}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-2 border-b border-slate-200">
                <span className="text-slate-500">Processed size:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {resultSize ? formatBytes(resultSize) : '—'}
                </span>
              </div>

              {originalTotalSize && resultSize && sizeReduction > 0 && (
                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-slate-500">Space saved:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    -{sizeReduction}% ({formatBytes(originalTotalSize - resultSize)})
                  </span>
                </div>
              )}
            </div>

            {/* OCR Extracted Text Box if available */}
            {extractedOcrText && (
              <div className="max-w-xl mx-auto text-left">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Extracted Text Preview:</span>
                  <button
                    onClick={copyExtractedText}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                  {extractedOcrText}
                </div>
              </div>
            )}

            {/* Download & Start Again buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download {resultFileName}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tool Features and FAQs for Rich SEO Content */}
      <div className="mt-12 space-y-10">
        {/* Features list */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
            Key Features of {tool.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tool.features.map((feat, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        {tool.faqs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {tool.faqs.map((faq, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl text-left">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{faq.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
