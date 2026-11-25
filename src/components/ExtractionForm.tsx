import { useState, useEffect, type FormEvent } from 'react';
import { Copy, RotateCcw, Save } from 'lucide-react';
import {
  JENIS_SURAT_OPTIONS,
  type JenisSurat,
  type SuratFormValues,
  validateSuratForm,
} from '../utils/surat';

interface ExtractionFormProps {
  initialValues: SuratFormValues;
  fileKey: string;
  onSave: (values: SuratFormValues) => void;
  onCopy: (values: SuratFormValues) => void;
  onReset: () => void;
}

export function ExtractionForm({
  initialValues,
  fileKey,
  onSave,
  onCopy,
  onReset,
}: ExtractionFormProps) {
  const [values, setValues] = useState<SuratFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof SuratFormValues, string>>>({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues, fileKey]);

  const updateField = <K extends keyof SuratFormValues>(
    field: K,
    value: SuratFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSuratForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({
      ...values,
      lampiran: values.lampiran.trim() || '-',
    });
  };

  const inputBase =
    'mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-700';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Form Hasil Ekstraksi Surat
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Seluruh kolom dapat disunting secara manual sebelum disalin atau disimpan ke arsip.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="field-jenis-surat"
            className="block text-xs font-semibold text-slate-700"
          >
            Jenis Surat
          </label>
          <select
            id="field-jenis-surat"
            value={values.jenisSurat}
            onChange={(e) => updateField('jenisSurat', e.target.value as JenisSurat)}
            className={`${inputBase} border-slate-200`}
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
            htmlFor="field-nomor-surat"
            className="block text-xs font-semibold text-slate-700"
          >
            Nomor Surat
          </label>
          <input
            id="field-nomor-surat"
            type="text"
            value={values.nomorSurat}
            onChange={(e) => updateField('nomorSurat', e.target.value)}
            placeholder="Contoh: 045/UND/XI/2026"
            className={`${inputBase} border-slate-200 font-mono text-[13px]`}
          />
        </div>

        <div>
          <label
            htmlFor="field-tanggal-surat"
            className="block text-xs font-semibold text-slate-700"
          >
            Tanggal Surat (DD-MM-YYYY)
          </label>
          <input
            id="field-tanggal-surat"
            type="text"
            value={values.tanggalSurat}
            onChange={(e) => updateField('tanggalSurat', e.target.value)}
            placeholder="DD-MM-YYYY"
            className={`${inputBase} border-slate-200 font-mono text-[13px] tabular-nums`}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="field-perihal"
            className="block text-xs font-semibold text-slate-700"
          >
            Perihal / Judul Surat <span className="text-red-600">*</span>
          </label>
          <input
            id="field-perihal"
            type="text"
            value={values.perihal}
            onChange={(e) => updateField('perihal', e.target.value)}
            placeholder="Masukkan perihal atau judul utama surat"
            aria-invalid={Boolean(errors.perihal)}
            className={`${inputBase} ${
              errors.perihal ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.perihal && (
            <p className="mt-1 text-xs text-red-600">{errors.perihal}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="field-pengirim"
            className="block text-xs font-semibold text-slate-700"
          >
            Pengirim / Instansi Asal <span className="text-red-600">*</span>
          </label>
          <input
            id="field-pengirim"
            type="text"
            value={values.pengirim}
            onChange={(e) => updateField('pengirim', e.target.value)}
            placeholder="Nama instansi, perusahaan, atau pejabat pengirim"
            aria-invalid={Boolean(errors.pengirim)}
            className={`${inputBase} ${
              errors.pengirim ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.pengirim && (
            <p className="mt-1 text-xs text-red-600">{errors.pengirim}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="field-tujuan"
            className="block text-xs font-semibold text-slate-700"
          >
            Tujuan / Penerima
          </label>
          <input
            id="field-tujuan"
            type="text"
            value={values.tujuan}
            onChange={(e) => updateField('tujuan', e.target.value)}
            placeholder="Pihak penerima surat"
            className={`${inputBase} border-slate-200`}
          />
        </div>

        <div>
          <label
            htmlFor="field-lampiran"
            className="block text-xs font-semibold text-slate-700"
          >
            Lampiran
          </label>
          <input
            id="field-lampiran"
            type="text"
            value={values.lampiran}
            onChange={(e) => updateField('lampiran', e.target.value)}
            placeholder="-"
            className={`${inputBase} border-slate-200`}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="field-ringkasan"
            className="block text-xs font-semibold text-slate-700"
          >
            Ringkasan Isi Surat <span className="text-red-600">*</span>
          </label>
          <textarea
            id="field-ringkasan"
            rows={3}
            value={values.ringkasan}
            onChange={(e) => updateField('ringkasan', e.target.value)}
            placeholder="Ringkasan padat 2–3 kalimat mengenai inti surat"
            aria-invalid={Boolean(errors.ringkasan)}
            className={`${inputBase} resize-y ${
              errors.ringkasan ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.ringkasan && (
            <p className="mt-1 text-xs text-red-600">{errors.ringkasan}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="field-poin-penting"
            className="block text-xs font-semibold text-slate-700"
          >
            Poin Penting / Tindak Lanjut
          </label>
          <textarea
            id="field-poin-penting"
            rows={3}
            value={values.poinPenting}
            onChange={(e) => updateField('poinPenting', e.target.value)}
            placeholder="Jadwal acara, tenggat waktu, lokasi, atau instruksi khusus"
            className={`${inputBase} resize-y border-slate-200`}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-700"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Batal / Reset</span>
        </button>

        <button
          type="button"
          onClick={() => onCopy(values)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-700"
        >
          <Copy className="h-4 w-4 text-slate-600" aria-hidden="true" />
          <span>Salin Info Surat</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>Simpan ke Arsip</span>
        </button>
      </div>
    </form>
  );
}
