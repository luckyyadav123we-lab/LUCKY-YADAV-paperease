import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TOOLS, CATEGORIES } from '../data/tools';
import { ToolCategory } from '../types';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Star } from 'lucide-react';

interface ToolGridProps {
  initialFilter?: ToolCategory | 'all' | 'popular';
}

export const ToolGrid: React.FC<ToolGridProps> = ({ initialFilter = 'popular' }) => {
  const { navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all' | 'popular'>(initialFilter);

  const displayedTools = TOOLS.filter((tool) => {
    if (selectedCategory === 'popular') return tool.popular;
    if (selectedCategory === 'all') return true;
    return tool.category === selectedCategory;
  });

  // Dynamic Lucide Icon resolver
  const renderIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.File;
    return <IconComponent className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />;
  };

  return (
    <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Filter Tabs (Functional segmented control) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Conversion & Editing Tools
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Select an operation to start processing your document or image.
          </p>
        </div>

        {/* Clean segmented control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-slate-100 rounded-xl max-w-full">
          <button
            onClick={() => setSelectedCategory('popular')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'popular'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Popular Tools
          </button>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({TOOLS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {displayedTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => navigateTo(tool.slug)}
            className="group relative p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Header row with Icon and status/popular marker */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50/80 group-hover:bg-blue-100/70 flex items-center justify-center transition-colors">
                  {renderIcon(tool.iconName)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-mono uppercase text-[11px] font-medium text-slate-400">
                    {tool.outputFormat.toUpperCase()}
                  </span>
                  {tool.popular && (
                    <span className="text-amber-500 font-bold" title="Popular tool">
                      ★
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base tracking-tight mb-1">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {tool.shortDescription}
              </p>
            </div>

            {/* Bottom action trigger with unboxed metadata */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
              <span className="truncate max-w-[140px] text-slate-400 font-mono text-[11px]">
                {tool.acceptedFormats.join(', ')}
              </span>
              <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
