import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, Lock, Trash2, Cpu, EyeOff, ServerOff } from 'lucide-react';

export const PrivacyModal: React.FC = () => {
  const { privacyModalOpen, setPrivacyModalOpen } = useApp();

  if (!privacyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Privacy & File Retention Architecture</h2>
              <p className="text-[11px] text-slate-500 font-mono">Zero-Retention Client Sandboxing Policy</p>
            </div>
          </div>
          <button
            onClick={() => setPrivacyModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ServerOff className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-sm mb-0.5">
                Your Files Never Touch a Third-Party Server
              </div>
              <p className="text-slate-600">
                Unlike legacy online converters that upload your confidential PDFs, contracts, and personal photos to remote cloud servers, PaperEase executes document transformation right in your browser memory via WebAssembly and Canvas 2D engines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Security Pillars</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Local Memory Isolation</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Files reside only in temporary volatile RAM. No unencrypted temp files are written to server disks.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatic Garbage Collection</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  When you close the browser tab or hit "Start Again", all memory buffers and object URLs are immediately revoked.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                  <span>Zero Content Inspection</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  We do not scrape, index, parse for ads, or train AI models on any of your documents or OCR extractions.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sandboxed Subprocess Safety</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Protection against embedded macros, malicious scripts, and memory buffer exploits in malformed files.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900">GDPR & CCPA Compliance Statement</h4>
            <p>
              Because PaperEase does not collect, retain, or store your documents, personal records, or proprietary corporate data on central servers, you retain 100% intellectual property ownership and satisfy stringent compliance mandates.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setPrivacyModalOpen(false)}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
