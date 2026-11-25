import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ArchiveTable } from './components/ArchiveTable';
import { Header } from './components/Header';
import { LetterDetailModal } from './components/LetterDetailModal';
import { SplitWorkspace } from './components/SplitWorkspace';
import { UploadZone } from './components/UploadZone';
import type {
  ArchivedLetter,
  ExtractedLetterData,
  UploadedDocument,
} from './types/letter';
import { deleteLetterFile, saveLetterFile } from './utils/fileStorage';
import {
  createEmptyLetterData,
  normalizeLetterExtraction,
  SEED_ARCHIVED_LETTERS,
  validateUploadFile,
} from './utils/letterUtils';
import { applyTheme, getInitialTheme, toggleThemeMode } from './utils/theme';
import type { ThemeMode } from './utils/theme';

const STORAGE_KEY = 'pembaca_surat_arsip_v1';

function loadInitialArchive(): ArchivedLetter[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ARCHIVED_LETTERS));
      return SEED_ARCHIVED_LETTERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback if storage is unavailable or corrupted
  }
  return SEED_ARCHIVED_LETTERS;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('Gagal membaca isi file.'));
        return;
      }
      resolve(result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [archivedLetters, setArchivedLetters] = useState<ArchivedLetter[]>(loadInitialArchive);
  const [activeDocument, setActiveDocument] = useState<UploadedDocument | null>(null);
  const [formData, setFormData] = useState<ExtractedLetterData>(createEmptyLetterData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ArchivedLetter | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const activeFileRef = useRef<{ file: File; mimeType: string } | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(archivedLetters));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [archivedLetters]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const analyzeFile = async (file: File, mimeType: string) => {
    const currentRequestId = ++requestIdRef.current;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const base64Data = await readFileAsBase64(file);
      const response = await fetch('/api/extract-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          mimeType,
          fileName: file.name,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (response.status === 413) {
        throw new Error(
          'Ukuran file melebihi batas unggahan server serverless (maksimal ~3 MB di Vercel). Silakan kompres dokumen atau lengkapi form secara manual.',
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'Gagal menganalisis dokumen surat. Silakan periksa file dan coba lagi.',
        );
      }

      const normalized = normalizeLetterExtraction(payload?.data);
      setFormData(normalized);
    } catch (err: unknown) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat membaca dokumen dengan AI.';
      setErrorMessage(message);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileSelected = (file: File) => {
    const validation = validateUploadFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    activeFileRef.current = { file, mimeType: validation.normalizedMimeType };

    setActiveDocument({
      fileName: file.name,
      mimeType: validation.normalizedMimeType,
      sizeBytes: file.size,
      previewUrl,
      isPdf: validation.normalizedMimeType === 'application/pdf',
    });

    setFormData(createEmptyLetterData());
    void analyzeFile(file, validation.normalizedMimeType);
  };

  const handleRetry = () => {
    if (!activeFileRef.current) return;
    void analyzeFile(activeFileRef.current.file, activeFileRef.current.mimeType);
  };

  const resetWorkspace = () => {
    requestIdRef.current += 1;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    activeFileRef.current = null;
    setActiveDocument(null);
    setFormData(createEmptyLetterData());
    setIsAnalyzing(false);
    setErrorMessage(null);
  };

  const handleSaveToArchive = async (data: ExtractedLetterData) => {
    const cleaned = normalizeLetterExtraction(data);
    const id = `arsip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const activeFile = activeFileRef.current;

    if (activeFile) {
      await saveLetterFile(id, activeFile.file, {
        fileName: activeFile.file.name,
        mimeType: activeFile.mimeType,
        sizeBytes: activeFile.file.size,
      });
    }

    const newEntry: ArchivedLetter = {
      ...cleaned,
      id,
      namaFile: activeDocument?.fileName ?? 'dokumen-manual',
      mimeType: activeFile?.mimeType,
      hasAttachment: Boolean(activeFile),
      savedAt: new Date().toISOString(),
    };

    setArchivedLetters((prev) => [newEntry, ...prev]);
    resetWorkspace();
    setSuccessMessage(
      `Surat "${cleaned.perihal || cleaned.nomorSurat || 'Baru'}" berhasil disimpan ke arsip.`,
    );
  };

  const handleDeleteLetter = (id: string) => {
    void deleteLetterFile(id);
    setArchivedLetters((prev) => prev.filter((item) => item.id !== id));
    if (selectedDetail?.id === id) {
      setSelectedDetail(null);
    }
  };

  const handleAttachFileToArchived = async (
    letterId: string,
    file: File,
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    const validation = validateUploadFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    await saveLetterFile(letterId, file, {
      fileName: file.name,
      mimeType: validation.normalizedMimeType,
      sizeBytes: file.size,
    });

    setArchivedLetters((prev) =>
      prev.map((item) =>
        item.id === letterId
          ? {
              ...item,
              namaFile: file.name,
              mimeType: validation.normalizedMimeType,
              hasAttachment: true,
            }
          : item,
      ),
    );

    setSelectedDetail((prev) =>
      prev && prev.id === letterId
        ? {
            ...prev,
            namaFile: file.name,
            mimeType: validation.normalizedMimeType,
            hasAttachment: true,
          }
        : prev,
    );

    return { ok: true };
  };

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      <Header
        totalLetters={archivedLetters.length}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => toggleThemeMode(prev))}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                aria-hidden="true"
              />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Tutup notifikasi sukses"
              className="rounded-md p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <UploadZone
          isAnalyzing={isAnalyzing}
          hasActiveDocument={Boolean(activeDocument)}
          activeFileName={activeDocument?.fileName}
          errorMessage={errorMessage}
          onFileSelected={handleFileSelected}
          onRetry={handleRetry}
          onDismissError={() => setErrorMessage(null)}
        />

        {activeDocument && (
          <SplitWorkspace
            document={activeDocument}
            formData={formData}
            isAnalyzing={isAnalyzing}
            onChange={setFormData}
            onSaveToArchive={handleSaveToArchive}
            onReset={resetWorkspace}
          />
        )}

        <ArchiveTable
          letters={archivedLetters}
          onViewDetail={setSelectedDetail}
          onDelete={handleDeleteLetter}
        />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
          <span>Pembaca Surat Otomatis · Penyimpanan arsip lokal di browser</span>
          <span>Format didukung: PDF, JPG, PNG, WEBP</span>
        </div>
      </footer>

      <LetterDetailModal
        letter={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onAttachFile={handleAttachFileToArchived}
      />
    </div>
  );
}
