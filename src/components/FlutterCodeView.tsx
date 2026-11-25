import { useState } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';
import { FLUTTER_CODE_FILES } from '../data/flutterCodeFiles';

export function FlutterCodeView() {
  const [selectedPath, setSelectedPath] = useState(FLUTTER_CODE_FILES[0].path);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const activeFile =
    FLUTTER_CODE_FILES.find((f) => f.path === selectedPath) ??
    FLUTTER_CODE_FILES[0];

  const handleCopyFile = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  return (
    <section className="mx-auto max-w-[1360px] py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Kode Sumber Proyek Flutter (Material 3)
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Arsitektur modular lengkap berada pada direktori <code className="font-mono text-slate-800">flutter_app/</code> mencakup{' '}
          <code className="font-mono text-slate-800">pubspec.yaml</code>,{' '}
          <code className="font-mono text-slate-800">models/surat_model.dart</code>,{' '}
          <code className="font-mono text-slate-800">services/gemini_service.dart</code>,{' '}
          <code className="font-mono text-slate-800">services/storage_service.dart</code>,{' '}
          <code className="font-mono text-slate-800">screens/home_screen.dart</code>, dan{' '}
          <code className="font-mono text-slate-800">widgets/</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* File Tree */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 lg:col-span-4 xl:col-span-3">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
            Daftar Berkas Flutter
          </div>
          <div className="mt-1 space-y-1">
            {FLUTTER_CODE_FILES.map((file) => {
              const isSelected = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileCode2
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'text-indigo-700' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate font-mono">{file.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Code Display */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-8 xl:col-span-9">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-mono text-sm font-semibold text-slate-900">
                flutter_app/{activeFile.path}
              </div>
              <div className="text-xs text-slate-500">{activeFile.group}</div>
            </div>

            <button
              type="button"
              onClick={handleCopyFile}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              {copiedPath === activeFile.path ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          <pre className="max-h-[640px] overflow-auto bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
