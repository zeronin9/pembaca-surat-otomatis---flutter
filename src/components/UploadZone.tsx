import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { AlertCircle, FileUp, Loader2, RefreshCw, X } from 'lucide-react';

interface UploadZoneProps {
  isAnalyzing: boolean;
  hasActiveDocument: boolean;
  activeFileName?: string;
  errorMessage: string | null;
  onFileSelected: (file: File) => void;
  onRetry: () => void;
  onDismissError: () => void;
}

export function UploadZone({
  isAnalyzing,
  hasActiveDocument,
  activeFileName,
  errorMessage,
  onFileSelected,
  onRetry,
  onDismissError,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Allow re-selecting the same file
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
      onFileSelected(file);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <section id="unggah-dokumen" aria-labelledby="upload-section-title" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1
            id="upload-section-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Ekstraksi &amp; Arsip Surat Masuk
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Unggah dokumen surat dalam format PDF atau gambar untuk dibaca otomatis dan diringkas ke form terstruktur.
          </p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
        } ${hasActiveDocument ? 'px-5 py-4' : 'px-6 py-10 sm:py-12'}`}
      >
        <input
          ref={inputRef}
          id="letter-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          aria-label="Pilih file dokumen surat PDF atau gambar"
          className="sr-only"
        />

        {isAnalyzing ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
          >
            <Loader2
              className="h-6 w-6 animate-spin text-blue-700 dark:text-blue-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Sedang menganalisis isi surat...
              </p>
              {activeFileName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {activeFileName}
                </p>
              )}
            </div>
          </div>
        ) : hasActiveDocument ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                Dokumen aktif:{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {activeFileName}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tarik dan lepas file baru ke area ini atau pilih file lain untuk mengganti dokumen.
              </p>
            </div>
            <button
              type="button"
              onClick={openFilePicker}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <FileUp className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
              <span>Ganti File</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400">
              <FileUp className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Tarik dan lepas file surat di sini
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mendukung PDF (.pdf) dan gambar (.jpg, .jpeg, .png, .webp) maksimal 15 MB. Proses ekstraksi berjalan otomatis saat file dipilih.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                <FileUp className="h-4 w-4" aria-hidden="true" />
                <span>Pilih File Surat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-900 dark:text-red-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {hasActiveDocument && !isAnalyzing && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors whitespace-nowrap"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Tutup pesan kesalahan"
              className="rounded-md p-1 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
