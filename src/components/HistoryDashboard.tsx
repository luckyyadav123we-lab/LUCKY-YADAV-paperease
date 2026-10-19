import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, downloadBlob } from '../services/zipService';
import { History, Download, Trash2, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

export const HistoryDashboard: React.FC = () => {
  const { jobs, clearHistory, deleteJob, navigateTo } = useApp();

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">Conversion History</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Recent File Conversions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your recent document sessions. Files processed locally are retained only in this browser session.
          </p>
        </div>

        {jobs.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No conversions recorded yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            When you merge, compress, or convert documents and images, they will appear in this history list.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            Convert Your First File
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tool & File</th>
                  <th className="py-3 px-4">Output File</th>
                  <th className="py-3 px-4 text-right">Original</th>
                  <th className="py-3 px-4 text-right">Processed</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{job.toolName}</div>
                      <div className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                        {job.inputFileName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 truncate max-w-[180px]">
                      {job.outputFileName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {formatBytes(job.inputFileSize)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatBytes(job.outputFileSize)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
