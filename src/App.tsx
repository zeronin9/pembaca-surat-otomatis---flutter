import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { AppHeader, type ActiveTab } from './components/AppHeader';
import { UploadDropzone } from './components/UploadDropzone';
import { DocumentPreview } from './components/DocumentPreview';
import { ExtractionForm } from './components/ExtractionForm';
import { ArchiveView } from './components/ArchiveView';
import { FlutterCodeView } from './components/FlutterCodeView';
import {
  EMPTY_SURAT_FORM,
  SEED_ARSIP_SURAT,
  type SuratArsipItem,
  type SuratFormValues,
  formatSuratForClipboard,
  normalizeExtractedSurat,
} from './utils/surat';
import {
  createSampleSuratFile,
  type SampleSuratSpec,
} from './utils/sampleDocuments';

const STORAGE_KEY = 'pembaca_surat_arsip_v1';
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function detectMimeType(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return '';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === 'string') {
        const commaIndex = res.indexOf(',');
        resolve(commaIndex >= 0 ? res.slice(commaIndex + 1) : res);
      } else {
        reject(new Error('Gagal membaca file sebagai base64.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas dokumen.'));
    reader.readAsDataURL(file);
  });
}

function loadInitialArchive(): SuratArsipItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ARSIP_SURAT));
    return SEED_ARSIP_SURAT;
  } catch {
    return SEED_ARSIP_SURAT;
  }
}

interface ToastState {
  message: string;
  tone: 'success' | 'error';
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('pemindai');
  const [arsip, setArsip] = useState<SuratArsipItem[]>(loadInitialArchive);

  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    mimeType: string;
    objectUrl: string;
    key: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedForm, setExtractedForm] =
    useState<SuratFormValues>(EMPTY_SURAT_FORM);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arsip));
    } catch {
      // Ignore quota errors
    }
  }, [arsip]);

  useEffect(() => {
    return () => {
      if (selectedFile?.objectUrl) {
        URL.revokeObjectURL(selectedFile.objectUrl);
      }
    };
  }, [selectedFile]);

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3600);
  };

  const resetScanner = () => {
    if (selectedFile?.objectUrl) {
      URL.revokeObjectURL(selectedFile.objectUrl);
    }
    setSelectedFile(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setExtractedForm(EMPTY_SURAT_FORM);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processSelectedFile = async (file: File) => {
    const mimeType = detectMimeType(file);
    if (!mimeType) {
      showToast(
        'Format file tidak didukung. Gunakan PDF (.pdf) atau gambar (.jpg, .jpeg, .png, .webp).',
        'error',
      );
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('Ukuran file melebihi batas 20 MB.', 'error');
      return;
    }

    if (selectedFile?.objectUrl) {
      URL.revokeObjectURL(selectedFile.objectUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const key = `${file.name}-${Date.now()}`;

    setActiveTab('pemindai');
    setSelectedFile({ file, mimeType, objectUrl, key });
    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedForm(EMPTY_SURAT_FORM);

    try {
      const fileBase64 = await fileToBase64(file);
      const response = await fetch('/api/extract-surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          fileName: file.name,
        }),
      });

      const payload = (await response.json()) as {
        data?: Partial<Record<keyof SuratFormValues, unknown>>;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(
          payload.error || 'Gagal membaca dan mengekstrak isi dokumen surat.',
        );
      }

      setExtractedForm(normalizeExtractedSurat(payload.data));
      setIsAnalyzing(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menganalisis isi surat.';
      setIsAnalyzing(false);
      setAnalysisError(msg);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleLoadSample = async (spec: SampleSuratSpec) => {
    try {
      const sampleFile = await createSampleSuratFile(spec);
      await processSelectedFile(sampleFile);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memuat contoh surat.';
      showToast(msg, 'error');
    }
  };

  const handleCopyInfo = async (values: SuratFormValues) => {
    const formatted = formatSuratForClipboard(values);
    try {
      await navigator.clipboard.writeText(formatted);
      showToast('Info surat berhasil disalin ke clipboard.');
    } catch {
      showToast('Gagal mengakses clipboard browser.', 'error');
    }
  };

  const handleSaveToArchive = (values: SuratFormValues) => {
    if (!selectedFile) return;
    const newItem: SuratArsipItem = {
      ...values,
      id: `surat-${Date.now()}`,
      namaFile: selectedFile.file.name,
      mimeType: selectedFile.mimeType,
      createdAt: new Date().toISOString(),
    };
    setArsip((prev) => [newItem, ...prev]);
    resetScanner();
    showToast('Surat berhasil disimpan ke arsip.');
  };

  const handleDeleteFromArchive = (id: string) => {
    setArsip((prev) => prev.filter((item) => item.id !== id));
    showToast('Surat dihapus dari riwayat arsip.');
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Pilih berkas dokumen surat"
      />

      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        archiveCount={arsip.length}
        onTriggerUpload={triggerFilePicker}
      />

      <main className="px-4 pb-16 sm:px-6 lg:px-8">
        {activeTab === 'pemindai' && (
          <div className="mx-auto max-w-[1360px]">
            {!selectedFile ? (
              <UploadDropzone
                onSelectFileClick={triggerFilePicker}
                onFileDrop={(f) => void processSelectedFile(f)}
                onLoadSample={(spec) => void handleLoadSample(spec)}
                totalArsip={arsip.length}
              />
            ) : isAnalyzing ? (
              <div className="mx-auto my-12 flex max-w-lg flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-14 text-center">
                <Loader2
                  className="h-10 w-10 animate-spin text-indigo-700"
                  aria-hidden="true"
                />
                <h2 className="mt-5 font-display text-lg font-bold text-slate-900">
                  Sedang menganalisis isi surat...
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Gemini 2.5 Flash sedang membaca dokumen{' '}
                  <span className="font-mono text-xs text-slate-800">
                    {selectedFile.file.name}
                  </span>{' '}
                  dan menyusun metadata terstruktur.
                </p>
              </div>
            ) : (
              <div className="py-6">
                {analysisError && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold">
                          Pembacaan otomatis belum berhasil
                        </p>
                        <p className="mt-0.5 text-xs text-red-800">
                          {analysisError} Anda tetap dapat mengisi form ekstraksi di
                          sebelah kanan secara manual sambil melihat pratinjau dokumen.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void processSelectedFile(selectedFile.file)}
                      className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 whitespace-nowrap shrink-0"
                    >
                      Coba Ulang
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-5 lg:sticky lg:top-20">
                    <DocumentPreview
                      objectUrl={selectedFile.objectUrl}
                      mimeType={selectedFile.mimeType}
                      fileName={selectedFile.file.name}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <ExtractionForm
                      initialValues={extractedForm}
                      fileKey={selectedFile.key}
                      onSave={handleSaveToArchive}
                      onCopy={(vals) => void handleCopyInfo(vals)}
                      onReset={resetScanner}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'arsip' && (
          <ArchiveView
            items={arsip}
            onDelete={handleDeleteFromArchive}
            onCopy={(item) => void handleCopyInfo(item)}
            onGoToScanner={() => setActiveTab('pemindai')}
            onExportSuccess={(count) =>
              showToast(`Berhasil mengekspor ${count} surat ke file CSV (UTF-8 BOM).`)
            }
          />
        )}

        {activeTab === 'flutter' && <FlutterCodeView />}
      </main>

      {/* Material 3 Snackbar / Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.tone === 'error' ? 'bg-red-700' : 'bg-slate-900'
          }`}
        >
          {toast.tone === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-200" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
