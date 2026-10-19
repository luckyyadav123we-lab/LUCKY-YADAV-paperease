import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UploadCloud,
  Cpu,
  Download,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Select or Drop Files',
      desc: 'Drag documents, photos, or spreadsheets straight from your desktop or phone into our clean workspace.',
      icon: UploadCloud,
    },
    {
      num: '02',
      title: 'Customize Your Parameters',
      desc: 'Set compression ratios, extract specific page ranges, configure transparency backgrounds, or select OCR languages.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Instant Download',
      desc: 'Files are compiled locally with genuine byte output. Download individual documents or a batch ZIP archive instantly.',
      icon: Download,
    },
  ];

  return (
    <section className="py-16 md:py-20 border-b border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            Streamlined Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            How PaperEase Simplifies Document Processing
          </h2>
          <p className="text-sm text-slate-500 mt-2 text-balance">
            No bulky desktop installs or complex command lines. Everything runs smoothly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-bold text-slate-300">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                  <span>Fast & Secure</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const WhyPaperEaseSection: React.FC = () => {
  const { setPricingModalOpen } = useApp();

  const benefits = [
    {
      title: 'Zero File Upload Risk',
      desc: 'Sensitive contracts and proprietary data are processed on your device. We do not store or inspect your documents.',
      icon: ShieldCheck,
    },
    {
      title: 'Blazing Fast Performance',
      desc: 'No waiting in remote server upload queues. Client-side WebAssembly processes megabytes in split seconds.',
      icon: Zap,
    },
    {
      title: 'Authentic Document Output',
      desc: 'Every file is compiled with genuine byte streams. We do not fake conversions or change extensions.',
      icon: FileCheck2,
    },
    {
      title: 'No Desktop Bloatware',
      desc: 'Replace multiple single-purpose desktop apps with one unified, responsive workspace accessible anywhere.',
      icon: Lock,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              The PaperEase Advantage
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance mb-4">
              Designed for Speed, Security, and Pixel-Perfect Precision
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Modern professionals shouldn’t have to compromise privacy or juggle dozens of sketchy websites just to merge two PDFs or extract text from a scanned receipt.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setPricingModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Pro Features</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is PaperEase really free to use?',
      a: 'Yes! PaperEase offers a generous free starter tier with up to 10 operations per day and 25 MB file sizes. No sign-up or credit card is required to use the free tier.',
    },
    {
      q: 'Are my uploaded documents uploaded to external servers?',
      a: 'No. File conversions (merging, splitting, rotating, image conversion, OCR) occur right within your browser memory sandbox. Your sensitive documents, receipts, and files never leave your device.',
    },
    {
      q: 'How does PaperEase handle PDF to Word and PowerPoint conversion?',
      a: 'We parse vector text streams and structural delimiters, packaging them into valid standard Open Packaging Convention XML files (.docx and .pptx). They open cleanly in Microsoft Office, Google Docs, and LibreOffice.',
    },
    {
      q: 'Can I compress PDF files without making text unreadable?',
      a: 'Yes. PaperEase offers Low, Balanced, and High compression profiles. We optimize object streams and redundant dictionary streams without degrading core typography.',
    },
    {
      q: 'Does optical character recognition (OCR) work on mobile devices?',
      a: 'Yes! Our neural OCR engine runs directly inside mobile web browsers (Safari, Chrome, Firefox) without needing desktop software.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything you need to know about our document conversion and privacy architecture.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between bg-white hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
