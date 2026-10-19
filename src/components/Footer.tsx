import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setPrivacyModalOpen, setPricingModalOpen } = useApp();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              PaperEase gives professionals, students, researchers, and teams an all-in-one workspace to convert, merge, compress, organize, and edit documents and images with local privacy.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Zero server file retention guaranteed</span>
            </div>
          </div>

          {/* PDF Tools Col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Popular PDF Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button onClick={() => navigateTo('pdf-to-word')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  PDF to Word
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('merge-pdf')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Merge Multiple PDFs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compress-pdf')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Compress PDF Size
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('split-pdf')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Split Pages from PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('pdf-to-excel')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  PDF to Excel
                </button>
              </li>
            </ul>
          </div>

          {/* Image Tools Col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Image Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button onClick={() => navigateTo('png-to-jpg')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  PNG to JPG
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('jpg-to-png')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  JPG to PNG
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('compress-image')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Compress JPG & PNG
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('png-to-webp')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  PNG to WEBP
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ocr-pdf')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Neural OCR Scanner
                </button>
              </li>
            </ul>
          </div>

          {/* Product & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button onClick={() => setPricingModalOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Plans & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Security & Privacy
                </button>
              </li>
              <li>
                <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-blue-600 transition-colors cursor-pointer">
                  File Retention Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('history')} className="hover:text-blue-600 transition-colors cursor-pointer">
                  Conversion History
                </button>
              </li>
              <li>
                <span className="text-slate-400">Support: support@paperease.io</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} PaperEase Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-slate-600 cursor-pointer">
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setPrivacyModalOpen(true)} className="hover:text-slate-600 cursor-pointer">
              Terms of Service
            </button>
            <span aria-hidden="true">·</span>
            <span>Production Grade v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
