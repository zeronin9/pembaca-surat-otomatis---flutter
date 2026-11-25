import { useState } from 'react';
import type { FormEvent } from 'react';
import { Archive, Check, Copy, Loader2, RotateCcw } from 'lucide-react';
import type { ExtractedLetterData, JenisSurat } from '../types/letter';
import { formatWhatsAppSummary, JENIS_SURAT_OPTIONS } from '../utils/letterUtils';

interface ExtractionFormProps {
  formData: ExtractedLetterData;
  isAnalyzing: boolean;
  onChange: (updated: ExtractedLetterData) => void;
  onSaveToArchive: (data: ExtractedLetterData) => void;
  onReset: () => void;
}

export function ExtractionForm({
  formData,
  isAnalyzing,
  onChange,
  onSaveToArchive,
  onReset,
}: ExtractionFormProps) {
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateField = <K extends keyof ExtractedLetterData>(
    key: K,
    value: ExtractedLetterData[K],
  ) => {
    if (validationError) setValidationError(null);
    onChange({ ...formData, [key]: value });
  };

  const handleCopyInfo = async () => {
    const text = formatWhatsAppSummary(formData);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for restricted clipboard contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formData.perihal.trim() && !formData.nomorSurat.trim() && !formData.pengirim.trim()) {
      setValidationError(
        'Mohon isi minimal Perihal, Nomor Surat, atau Pengirim sebelum menyimpan ke arsip.',
      );
      return;
    }
    setValidationError(null);
    onSaveToArchive(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden h-full transition-colors"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Form Hasil Ekstraksi Surat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Periksa dan sunting data di bawah sebelum disimpan ke arsip.
          </p>
        </div>
        {isAnalyzing && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>Memproses AI</span>
          </span>
        )}
      </div>

      <div className="flex-1 p-5 space-y-4">
        {validationError && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs font-medium text-amber-900 dark:text-amber-200"
          >
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-jenis-surat"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Jenis Surat
            </label>
            <select
              id="field-jenis-surat"
              value={formData.jenisSurat}
              disabled={isAnalyzing}
              onChange={(e) => updateField('jenisSurat', e.target.value as JenisSurat)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            >
              {JENIS_SURAT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="field-tanggal-surat"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Tanggal Surat{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">(DD-MM-YYYY)</span>
            </label>
            <input
              id="field-tanggal-surat"
              type="text"
              value={formData.tanggalSurat}
              disabled={isAnalyzing}
              placeholder="Contoh: 16-11-2026"
              onChange={(e) => updateField('tanggalSurat', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-nomor-surat"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Nomor Surat
            </label>
            <input
              id="field-nomor-surat"
              type="text"
              value={formData.nomorSurat}
              disabled={isAnalyzing}
              placeholder="Contoh: 045/UND/XI/2026"
              onChange={(e) => updateField('nomorSurat', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="field-lampiran"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Lampiran
            </label>
            <input
              id="field-lampiran"
              type="text"
              value={formData.lampiran}
              disabled={isAnalyzing}
              placeholder='Isi "-" jika tidak ada'
              onChange={(e) => updateField('lampiran', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="field-perihal"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Perihal / Judul Surat
          </label>
          <input
            id="field-perihal"
            type="text"
            value={formData.perihal}
            disabled={isAnalyzing}
            placeholder="Perihal atau judul utama surat"
            onChange={(e) => updateField('perihal', e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="field-pengirim"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Pengirim / Instansi Asal
            </label>
            <input
              id="field-pengirim"
              type="text"
              value={formData.pengirim}
              disabled={isAnalyzing}
              placeholder="Nama instansi atau pengirim"
              onChange={(e) => updateField('pengirim', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="field-tujuan"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Tujuan / Penerima
            </label>
            <input
              id="field-tujuan"
              type="text"
              value={formData.tujuan}
              disabled={isAnalyzing}
              placeholder="Pihak yang dituju pada surat"
              onChange={(e) => updateField('tujuan', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="field-ringkasan"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Ringkasan Isi Surat
          </label>
          <textarea
            id="field-ringkasan"
            rows={3}
            value={formData.ringkasan}
            disabled={isAnalyzing}
            placeholder="2-3 kalimat padat yang menjelaskan inti surat..."
            onChange={(e) => updateField('ringkasan', e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="field-poin-penting"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Poin Penting / Tindak Lanjut
          </label>
          <textarea
            id="field-poin-penting"
            rows={3}
            value={formData.poinPenting}
            disabled={isAnalyzing}
            placeholder="Jadwal acara, tenggat waktu, atau instruksi khusus..."
            onChange={(e) => updateField('poinPenting', e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyInfo}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
            <span>Batal / Reset</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          <span>Simpan ke Arsip</span>
        </button>
      </div>
    </form>
  );
}
