import { useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { UploadedDocument } from '../types/letter';

interface DocumentPreviewProps {
  document: UploadedDocument;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'fit' | 'custom'>('fit');

  const handleZoomIn = () => {
    setFitMode('custom');
    setZoomPercent((prev) => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoomPercent((prev) => Math.max(prev - 25, 50));
  };

  const handleFitReset = () => {
    setFitMode('fit');
    setZoomPercent(100);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden h-full transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Preview Dokumen Asli
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            <span>{document.isPdf ? 'PDF' : 'Gambar'}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span className="font-mono tabular-nums">{formatSize(document.sizeBytes)}</span>
          </p>
        </div>

        {!document.isPdf && (
          <div className="flex items-center gap-1" role="toolbar" aria-label="Kontrol zoom gambar">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={fitMode === 'custom' && zoomPercent <= 50}
              aria-label="Perkecil tampilan gambar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>
            <span
              className="px-2 text-xs font-mono font-medium tabular-nums text-slate-700 dark:text-slate-300 min-w-[3.5rem] text-center"
              aria-live="polite"
            >
              {fitMode === 'fit' ? 'Fit' : `${zoomPercent}%`}
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={fitMode === 'custom' && zoomPercent >= 250}
              aria-label="Perbesar tampilan gambar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleFitReset}
              aria-label="Sesuaikan ukuran gambar ke panel"
              aria-pressed={fitMode === 'fit'}
              className={`ml-1 inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                fitMode === 'fit'
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {fitMode === 'fit' ? (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>Fit</span>
            </button>
            {fitMode === 'custom' && (
              <button
                type="button"
                onClick={handleFitReset}
                aria-label="Reset zoom gambar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative flex-1 bg-slate-100 dark:bg-slate-950 min-h-[460px] lg:min-h-[680px] overflow-auto">
        {document.isPdf ? (
          <iframe
            src={document.previewUrl}
            title={`Preview PDF ${document.fileName}`}
            className="h-full min-h-[560px] lg:min-h-[680px] w-full border-0 bg-white"
          />
        ) : (
          <div className="flex min-h-full w-full items-start justify-center p-4">
            <img
              src={document.previewUrl}
              alt={`Preview dokumen surat ${document.fileName}`}
              referrerPolicy="no-referrer"
              style={
                fitMode === 'fit'
                  ? undefined
                  : { width: `${zoomPercent}%`, maxWidth: 'none' }
              }
              className={
                fitMode === 'fit'
                  ? 'max-h-[640px] w-auto max-w-full rounded border border-slate-200 dark:border-slate-700 bg-white object-contain shadow-sm'
                  : 'h-auto rounded border border-slate-200 dark:border-slate-700 bg-white shadow-sm'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
