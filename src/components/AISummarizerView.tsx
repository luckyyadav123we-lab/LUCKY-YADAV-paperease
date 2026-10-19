import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { extractTextFromPDF } from '../services/documentEngine';
import { summarizeDocument, AISummaryResult } from '../services/aiService';
import { textToPDF } from '../services/documentEngine';
import { downloadBlob, formatBytes } from '../services/zipService';
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  MessageSquare,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';

interface AISummarizerViewProps {
  initialFile?: File | null;
  onOpenChatWithFile?: (file: File, extractedText?: string) => void;
}

export const AISummarizerView: React.FC<AISummarizerViewProps> = ({
  initialFile,
  onOpenChatWithFile,
}) => {
  const { showToast, recordOperation, navigateTo } = useApp();
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [lengthProfile, setLengthProfile] = useState<'brief' | 'balanced' | 'deep'>('balanced');
  const [focusAngle, setFocusAngle] = useState<'general' | 'action-items' | 'metrics'>('general');
  const [summaryResult, setSummaryResult] = useState<AISummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  // When initialFile changes
  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      handleFileSelected(initialFile);
    }
  }, [initialFile]);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setSummaryResult(null);
    setIsExtracting(true);

    try {
      let text = '';
      if (selectedFile.name.toLowerCase().endsWith('.txt')) {
        text = await selectedFile.text();
      } else {
        // PDF or docx text extraction
        text = await extractTextFromPDF(selectedFile);
      }
      setExtractedText(text);
      setIsExtracting(false);
    } catch {
      setIsExtracting(false);
      showToast('Could not extract text layer from document. Please ensure file is readable.', 'error');
    }
  };

  const handleRunSummarize = async () => {
    if (!file || !extractedText) {
      showToast('Please upload a document first.', 'error');
      return;
    }

    if (!recordOperation(file.size)) return;

    setIsSummarizing(true);
    try {
      const result = await summarizeDocument(extractedText, {
        length: lengthProfile,
        focus: focusAngle,
        fileName: file.name,
      });

      setSummaryResult(result);
      setIsSummarizing(false);
      showToast('AI summary generated successfully!', 'success');
    } catch (err: any) {
      setIsSummarizing(false);
      showToast(err.message || 'Summarization failed. Please retry.', 'error');
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    const textToCopy = `EXECUTIVE SUMMARY (${file?.name || 'Document'}):\n\n${summaryResult.summary}\n\nKEY TAKEAWAYS:\n${summaryResult.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Summary copied to clipboard!', 'success');
  };

  const handleExportPDF = async () => {
    if (!summaryResult || !file) return;
    try {
      const fullContent = `SUMMARY REPORT: ${file.name.toUpperCase()}\nGenerated via PaperEase AI Intelligence\n\nEXECUTIVE OVERVIEW:\n${summaryResult.summary}\n\nKEY TAKEAWAYS & MILESTONES:\n${summaryResult.keyPoints.map((p, i) => `[${i + 1}] ${p}`).join('\n\n')}\n\nTOPICAL THEMES: ${summaryResult.themes.join(' • ')}\nTotal Word Count: ${summaryResult.wordCount} words`;

      const dummyTxtFile = new File([fullContent], `${file.name.replace(/\.[^/.]+$/, '')}_AI_Summary.txt`, { type: 'text/plain' });
      const pdfBlob = await textToPDF(dummyTxtFile, { orientation: 'p', fontSize: 11 });
      downloadBlob(pdfBlob, `${file.name.replace(/\.[^/.]+$/, '')}_AI_Summary.pdf`);
      showToast('Summary exported as PDF!', 'success');
    } catch {
      showToast('Failed to export PDF.', 'error');
    }
  };

  const handleExportDOCX = () => {
    if (!summaryResult || !file) return;
    const fullContent = `EXECUTIVE SUMMARY: ${file.name}\n\n${summaryResult.summary}\n\nKEY FINDINGS:\n${summaryResult.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nThemes: ${summaryResult.themes.join(', ')}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, '')}_Summary.txt`);
    showToast('Summary downloaded as text file!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Upload Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash Engine</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Document Summarizer</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distill long PDFs, reports, and contracts into executive overviews and actionable takeaways.
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{file.name}</div>
                <div className="text-[10px] text-slate-400">{formatBytes(file.size)} · {extractedText ? `${extractedText.split(' ').length} words` : 'Extracting...'}</div>
              </div>
            </div>
          )}
        </div>

        {/* File Dropzone if no file selected */}
        {!file ? (
          <div className="py-8">
            <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3 shadow-2xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Choose a PDF or Document to Summarize
              </span>
              <span className="text-xs text-slate-500 mt-1 max-w-sm">
                Drop your PDF, research paper, report, or contract here. Zero remote data retention.
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="pt-6 space-y-5">
            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Length Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Summary Length Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'brief', label: 'Brief', desc: '1-para executive' },
                    { id: 'balanced', label: 'Balanced', desc: 'Core highlights' },
                    { id: 'deep', label: 'Deep Dive', desc: 'Section breakdown' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setLengthProfile(p.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        lengthProfile === p.id
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs text-blue-900 ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Angle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Analysis Focus Angle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'general', label: 'General', desc: 'Balanced context' },
                    { id: 'action-items', label: 'Action Items', desc: 'Next steps & tasks' },
                    { id: 'metrics', label: 'Key Metrics', desc: 'Numbers & dates' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFocusAngle(f.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        focusAngle === f.id
                          ? 'bg-blue-50/80 border-blue-500 shadow-2xs text-blue-900 ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <label className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline">
                Change File
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                disabled={isSummarizing || isExtracting}
                onClick={handleRunSummarize}
                className="py-3 px-6 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition-all cursor-pointer flex items-center gap-2"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Document with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Summary</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Structured Result Display */}
      {summaryResult && (
        <div className="bg-white rounded-2xl border border-blue-200/90 shadow-[0_10px_35px_-5px_rgba(37,99,235,0.12)] p-6 sm:p-8 space-y-6">
          {/* Top metadata row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Executive Summary Output</h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{summaryResult.wordCount} words analyzed</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    ~{summaryResult.readingTimeMinutes} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleExportDOCX}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Text</span>
              </button>
            </div>
          </div>

          {/* Executive Overview Box */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/70 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {summaryResult.summary}
          </div>

          {/* Key Takeaways Section */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Key Takeaways & Critical Insights</span>
            </h5>
            <div className="space-y-2.5">
              {summaryResult.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-xs text-slate-700 leading-relaxed hover:border-blue-200 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">{point}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Themes / Tags */}
          {summaryResult.themes && summaryResult.themes.length > 0 && (
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400">Core Themes:</span>
              {summaryResult.themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-medium"
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}

          {/* Seamless bridge to Chat with PDF */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Have questions about this document?</div>
                <div className="text-[11px] text-slate-500">Ask anything and get exact citations with Chat with PDF.</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (file) {
                  if (onOpenChatWithFile) {
                    onOpenChatWithFile(file, extractedText);
                  } else {
                    navigateTo('chat-pdf');
                  }
                }
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Chat with this Document</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
