import { useState, type WheelEvent, type MouseEvent } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface DocumentPreviewProps {
  objectUrl: string;
  mimeType: string;
  fileName: string;
}

export function DocumentPreview({
  objectUrl,
  mimeType,
  fileName,
}: DocumentPreviewProps) {
  const isPdf = mimeType === 'application/pdf';
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  const zoomIn = () => setScale((s) => Math.min(4, Number((s + 0.25).toFixed(2))));
  const zoomOut = () => setScale((s) => Math.max(0.6, Number((s - 0.25).toFixed(2))));
  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isPdf) return;
    if (e.ctrlKey || e.metaKey || scale > 1) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((s) => Math.min(4, Math.max(0.6, Number((s + delta).toFixed(2)))));
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isPdf || scale <= 1) return;
    setDragging(true);
    setDragOrigin({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragOrigin.x,
      y: e.clientY - dragOrigin.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {isPdf ? (
            <FileText className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
          ) : (
            <ImageIcon className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
          )}
          <span
            className="truncate text-sm font-semibold text-slate-900"
            title={fileName}
          >
            {fileName}
          </span>
        </div>

        {!isPdf ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={zoomOut}
              aria-label="Perkecil pratinjau gambar"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-[3.2rem] text-center font-mono text-xs tabular-nums text-slate-600">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              aria-label="Perbesar pratinjau gambar"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              aria-label="Atur ulang ukuran pratinjau"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <a
            href={objectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 whitespace-nowrap shrink-0"
          >
            <span>Buka Tab</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex min-h-[380px] flex-1 items-center justify-center overflow-hidden bg-slate-100/80 lg:min-h-[620px] ${
          !isPdf && scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {isPdf ? (
          <object
            data={objectUrl}
            type="application/pdf"
            aria-label={`Pratinjau dokumen PDF ${fileName}`}
            className="h-full min-h-[380px] w-full lg:min-h-[620px]"
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-700">
                Pratinjau PDF tertanam tidak didukung oleh browser ini.
              </p>
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800"
              >
                Buka Dokumen PDF
              </a>
            </div>
          </object>
        ) : (
          <img
            src={objectUrl}
            alt={`Pratinjau dokumen ${fileName}`}
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 140ms ease-out',
            }}
            className="max-h-full max-w-full select-none object-contain p-3"
          />
        )}
      </div>
    </div>
  );
}
