import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';
import {
  UploadCloud,
  Search,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Minimize2,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { Logo } from './Logo';

interface HeroProps {
  onDirectFileDropped: (file: File) => void;
}

export const Hero: React.FC<HeroProps> = ({ onDirectFileDropped }) => {
  const { navigateTo, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.acceptedFormats.some((fmt) => fmt.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDirectFileDropped(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDirectFileDropped(e.target.files[0]);
    }
  };

  // Popular tool shortcuts
  const popularShortcuts = [
    { label: 'PDF to Word', slug: 'pdf-to-word', icon: FileText },
    { label: 'Merge PDF', slug: 'merge-pdf', icon: Layers },
    { label: 'Compress PDF', slug: 'compress-pdf', icon: Minimize2 },
    { label: 'PNG to JPG', slug: 'png-to-jpg', icon: ImageIcon },
    { label: 'PDF to Excel', slug: 'pdf-to-excel', icon: FileSpreadsheet },
    { label: 'JPG to PDF', slug: 'jpg-to-pdf', icon: FileText },
  ];

  return (
    <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9]/40">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/40 via-violet-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand Banner Mark matching uploaded asset with glowing 3D depth */}
        <div className="flex justify-center mb-6">
          <div className="px-6 py-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-[0_10px_35px_-5px_rgba(37,99,235,0.18),0_0_20px_rgba(139,92,246,0.15)] inline-flex items-center ring-1 ring-blue-500/15 hover:shadow-[0_14px_45px_-5px_rgba(37,99,235,0.25),0_0_28px_rgba(139,92,246,0.22)] transition-all duration-300">
            <Logo size="lg" showTagline={true} />
          </div>
        </div>

        {/* Anti-slop unboxed quiet text metadata */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 mb-4 tracking-wide uppercase">
          <span>Private Local Processing</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Zero File Size Decay</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Instant Download</span>
        </div>

        {/* Hero Headline with text-wrap: balance */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance leading-[1.15]">
          Every File. Every Format.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            One Simple Workspace.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto text-balance leading-relaxed">
          Convert PDFs, images, and documents in seconds. Compress, edit, organize, and download your files in one secure workspace.
        </p>

        {/* Universal Drag & Drop Upload Zone */}
        <div className="mt-9 max-w-2xl mx-auto">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 md:p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/80 shadow-lg scale-[1.01]'
                : 'border-slate-300 hover:border-blue-500 bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              multiple
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100/80 text-blue-600 flex items-center justify-center mb-4 transition-colors">
                <UploadCloud className="w-8 h-8 transition-transform group-hover:-translate-y-0.5" />
              </div>

              <div className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                Drop your file here, or{' '}
                <span className="text-blue-600 group-hover:underline">Browse Files</span>
              </div>

              <p className="text-xs text-slate-500 mt-1 max-w-md">
                PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), PNG, JPG, WEBP, CSV, TXT
              </p>

              {/* Upload limits note */}
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>Max size: {user.maxFileSizeMB} MB</span>
                <span aria-hidden="true">·</span>
                <span>{user.tier === 'free' ? `${user.operationsToday}/${user.maxDailyOperations} operations today` : 'Unlimited Pro'}</span>
              </div>
            </div>
          </div>

          {/* Quick Search for a Tool */}
          <div className="relative mt-5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search any tool (e.g., PDF to Word, Merge, Compress, OCR, PNG to JPG)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant search results popover */}
            {filteredTools.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-20 text-left">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSearchQuery('');
                      navigateTo(tool.slug);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none text-left cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{tool.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tool.shortDescription}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular Shortcuts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">Popular:</span>
            {popularShortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.slug}
                  onClick={() => navigateTo(sc.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
