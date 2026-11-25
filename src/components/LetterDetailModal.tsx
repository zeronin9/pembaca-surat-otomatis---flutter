import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileUp,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ArchivedLetter } from '../types/letter';
import { getLetterFile } from '../utils/fileStorage';
import { formatWhatsAppSummary } from '../utils/letterUtils';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface LetterDetailModalProps {
  letter: ArchivedLetter | null;
  onClose: () => void;
  onAttachFile: (
    letterId: string,
    file: File,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

interface PreviewAsset {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  blob: Blob;
  isPdf: boolean;
}

export function LetterDetailModal({
  letter,
  onClose,
  onAttachFile,
}: LetterDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<PreviewAsset | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'fit' | 'custom'>('fit');
  const [reloadTick, setReloadTick] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!letter) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [letter, onClose]);

  useEffect(() => {
    if (!letter) {
      setPreviewAsset(null);
      setAttachError(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    setIsLoadingFile(true);
    setAttachError(null);
    setFitMode('fit');
    setZoomPercent(100);

    getLetterFile(letter.id)
      .then((stored) => {
        if (cancelled) return;
        if (stored) {
          createdUrl = URL.createObjectURL(stored.blob);
          setPreviewAsset({
            fileName: stored.fileName,
            mimeType: stored.mimeType,
            sizeBytes: stored.sizeBytes,
            url: createdUrl,
            blob: stored.blob,
            isPdf: stored.mimeType === 'application/pdf',
          });
        } else {
          setPreviewAsset(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFile(false);
        }
      });

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [letter?.id, letter?.namaFile, letter?.hasAttachment, reloadTick]);

  if (!letter) return null;

  const handleCopy = async () => {
    const text = formatWhatsAppSummary(letter);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const processAttachedFile = async (file: File) => {
    setIsAttaching(true);
    setAttachError(null);
    const result = await onAttachFile(letter.id, file);
    setIsAttaching(false);
    if (!result.ok) {
      setAttachError(result.error);
      return;
    }
    setReloadTick((t) => t + 1);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processAttachedFile(file);
    }
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processAttachedFile(file);
    }
  };

  const handleDownloadFile = () => {
    if (!previewAsset) return;
    const link = document.createElement('a');
    link.href = previewAsset.url;
    link.download = previewAsset.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 dark:bg-black/75 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden max-h-[92vh] flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              {letter.jenisSurat}
            </p>
            <h3
              id="modal-detail-title"
              className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 leading-snug"
            >
              {letter.perihal || 'Detail Surat'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal detail"
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Kolom Kiri: Metadata & Ringkasan */}
          <div className="lg:col-span-6 p-6 space-y-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nomor Surat
                </dt>
                <dd className="mt-1 font-mono text-slate-900 dark:text-slate-100 break-words">
                  {letter.nomorSurat || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tanggal Surat
                </dt>
                <dd className="mt-1 font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {letter.tanggalSurat || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pengirim / Instansi Asal
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-100">
                  {letter.pengirim || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tujuan / Penerima
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-100">
                  {letter.tujuan || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Lampiran
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-100">
                  {letter.lampiran || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nama File Sumber
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                  {previewAsset?.fileName || letter.namaFile || '-'}
                </dd>
              </div>
            </dl>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ringkasan Isi Surat
                </h4>
                <p className="mt-1.5 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {letter.ringkasan || '-'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Poin Penting / Tindak Lanjut
                </h4>
                <p className="mt-1.5 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {letter.poinPenting || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Lampiran File Asli */}
          <div className="lg:col-span-6 flex flex-col bg-slate-50/70 dark:bg-slate-950/60">
            <input
              ref={fileInputRef}
              id="detail-attach-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              aria-label="Lampirkan atau ganti file asli surat"
              className="sr-only"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  File Asli Surat
                </h4>
                {previewAsset ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    <span>{previewAsset.isPdf ? 'PDF' : 'Gambar'}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span className="font-mono tabular-nums">
                      {formatSize(previewAsset.sizeBytes)}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Belum ada file terlampir
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {previewAsset && (
                  <div
                    className="flex items-center gap-1 mr-1"
                    role="toolbar"
                    aria-label="Kontrol zoom lampiran"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('custom');
                        setZoomPercent((prev) => Math.max(prev - 25, 50));
                      }}
                      disabled={fitMode === 'custom' && zoomPercent <= 50}
                      aria-label="Perkecil lampiran gambar"
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="px-1.5 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                      {fitMode === 'fit' ? 'Fit' : `${zoomPercent}%`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('custom');
                        setZoomPercent((prev) => Math.min(prev + 25, 250));
                      }}
                      disabled={fitMode === 'custom' && zoomPercent >= 250}
                      aria-label="Perbesar lampiran gambar"
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('fit');
                        setZoomPercent(100);
                      }}
                      aria-label="Sesuaikan ukuran lampiran gambar"
                      aria-pressed={fitMode === 'fit'}
                      className={`inline-flex h-7 items-center gap-1 rounded border px-2 text-xs font-medium transition-colors whitespace-nowrap ${
                        fitMode === 'fit'
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {fitMode === 'fit' ? (
                        <Maximize2 className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Minimize2 className="h-3 w-3" aria-hidden="true" />
                      )}
                      <span>Fit</span>
                    </button>
                    {fitMode === 'custom' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFitMode('fit');
                          setZoomPercent(100);
                        }}
                        aria-label="Reset zoom lampiran"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {previewAsset && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      className="inline-flex h-7 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      <Download
                        className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400"
                        aria-hidden="true"
                      />
                      <span>Unduh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAttaching}
                      className="inline-flex h-7 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <FileUp
                        className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
                        aria-hidden="true"
                      />
                      <span>Ganti File</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {attachError && (
              <div
                role="alert"
                className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-900 dark:text-red-200"
              >
                <AlertCircle
                  className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{attachError}</span>
              </div>
            )}

            <div className="flex-1 min-h-[340px] lg:min-h-[440px] overflow-auto p-4 flex flex-col">
              {isLoadingFile || isAttaching ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <Loader2
                    className="h-5 w-5 animate-spin text-blue-700 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium">
                    {isAttaching ? 'Menyimpan lampiran file asli...' : 'Memuat file asli surat...'}
                  </p>
                </div>
              ) : previewAsset ? (
                previewAsset.isPdf ? (
                  <PdfCanvasViewer
                    blob={previewAsset.blob}
                    fileName={previewAsset.fileName}
                    fitMode={fitMode}
                    zoomPercent={zoomPercent}
                  />
                ) : (
                  <div className="flex flex-1 items-start justify-center">
                    <img
                      src={previewAsset.url}
                      alt={`Lampiran file asli ${previewAsset.fileName}`}
                      referrerPolicy="no-referrer"
                      style={
                        fitMode === 'fit'
                          ? undefined
                          : { width: `${zoomPercent}%`, maxWidth: 'none' }
                      }
                      className={
                        fitMode === 'fit'
                          ? 'max-h-[420px] w-auto max-w-full rounded border border-slate-200 dark:border-slate-700 bg-white object-contain shadow-sm'
                          : 'h-auto rounded border border-slate-200 dark:border-slate-700 bg-white shadow-sm'
                      }
                    />
                  </div>
                )
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400">
                    <FileUp className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Belum ada file asli yang terlampir
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                    Lampirkan file PDF atau gambar hasil scan surat ini agar dapat dilihat langsung dan diunduh kapan saja dari arsip.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap"
                  >
                    <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Lampirkan File Asli</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-3.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-700 dark:text-emerald-300">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                <span>Salin Info Surat</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
