import { useState, type DragEvent } from 'react';
import { FileText, FolderOpen, Sparkles } from 'lucide-react';
import { SAMPLE_SURAT_SPECS, type SampleSuratSpec } from '../utils/sampleDocuments';

interface UploadDropzoneProps {
  onSelectFileClick: () => void;
  onFileDrop: (file: File) => void;
  onLoadSample: (spec: SampleSuratSpec) => void;
  totalArsip: number;
}

export function UploadDropzone({
  onSelectFileClick,
  onFileDrop,
  onLoadSample,
  totalArsip,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileDrop(file);
    }
  };

  return (
    <section className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
            Pindai dan Ekstrak Surat Resmi Secara Otomatis
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Unggah berkas PDF atau foto surat untuk membaca nomor surat, tanggal, pengirim,
            ringkasan isi, hingga poin tindak lanjut menggunakan Gemini 2.5 Flash.
          </p>
        </div>
        <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
          Total surat tersimpan: <strong className="font-semibold text-slate-800">{totalArsip}</strong>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors sm:px-10 sm:py-16 ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/70'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
          <FileText className="h-8 w-8" aria-hidden="true" />
        </div>

        <h2 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
          Seret dokumen surat ke sini atau pilih dari perangkat
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
          Format yang didukung: PDF (.pdf) serta gambar (.jpg, .jpeg, .png, .webp).
          Analisis AI berjalan otomatis segera setelah dokumen dipilih.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSelectFileClick}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            <span>Pilih File Dokumen</span>
          </button>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          PDF · JPG · JPEG · PNG · WEBP · Maksimal 20 MB
        </p>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Uji Coba Cepat dengan Contoh Surat Resmi
            </h3>
            <p className="text-xs text-slate-600">
              Membuat berkas PNG surat resmi beresolusi tinggi dan mengirimkannya ke ekstraksi Gemini 2.5 Flash.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {SAMPLE_SURAT_SPECS.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => onLoadSample(spec)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                <span>{spec.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
