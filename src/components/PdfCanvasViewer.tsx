import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfCanvasViewerProps {
  blob: Blob;
  fileName: string;
  fitMode: 'fit' | 'custom';
  zoomPercent: number;
}

export function PdfCanvasViewer({
  blob,
  fileName,
  fitMode,
  zoomPercent,
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pagesHostRef = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(480);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(240, Math.floor(el.clientWidth - 16));
      setContainerWidth((prev) => (Math.abs(prev - next) > 4 ? next : prev));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    async function renderPdf() {
      setIsRendering(true);
      setError(null);

      try {
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;

        loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdfDoc.numPages);

        const host = pagesHostRef.current;
        if (!host) return;
        host.innerHTML = '';

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(pageNum);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const fitScale = containerWidth / baseViewport.width;
          const targetScale =
            fitMode === 'fit' ? fitScale : fitScale * (zoomPercent / 100);
          const cssViewport = page.getViewport({ scale: targetScale });
          const renderViewport = page.getViewport({ scale: targetScale * dpr });

          const pageWrapper = document.createElement('div');
          pageWrapper.className =
            'flex flex-col items-center gap-1.5 w-full';

          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(renderViewport.width);
          canvas.height = Math.ceil(renderViewport.height);
          canvas.style.width = `${Math.floor(cssViewport.width)}px`;
          canvas.style.height = `${Math.floor(cssViewport.height)}px`;
          canvas.className =
            'rounded border border-slate-200 dark:border-slate-700 bg-white shadow-sm';
          canvas.setAttribute(
            'aria-label',
            `Halaman ${pageNum} dari ${fileName}`,
          );

          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({
              canvasContext: ctx,
              viewport: renderViewport,
              canvas,
            }).promise;
          }

          const caption = document.createElement('span');
          caption.className =
            'text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400';
          caption.textContent = `Halaman ${pageNum} / ${pdfDoc.numPages}`;

          pageWrapper.appendChild(canvas);
          pageWrapper.appendChild(caption);
          host.appendChild(pageWrapper);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Gagal merender dokumen PDF.';
          setError(
            `Dokumen PDF tidak dapat ditampilkan di browser (${msg}). Gunakan tombol Unduh di atas untuk membukanya.`,
          );
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        void loadingTask.destroy();
      }
      if (pdfDoc) {
        void pdfDoc.cleanup();
      }
    };
  }, [blob, fileName, containerWidth, fitMode, zoomPercent]);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col items-center">
      {isRendering && (
        <div className="flex items-center gap-2 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <Loader2
            className="h-4 w-4 animate-spin text-blue-700 dark:text-blue-400"
            aria-hidden="true"
          />
          <span>
            Merender halaman PDF{pageCount > 0 ? ` (${pageCount} halaman)` : ''}...
          </span>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-900 dark:text-red-200"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      ) : (
        <div
          ref={pagesHostRef}
          data-testid="pdf-canvas-pages"
          className="flex w-full flex-col items-center gap-4 pb-2"
        />
      )}
    </div>
  );
}
