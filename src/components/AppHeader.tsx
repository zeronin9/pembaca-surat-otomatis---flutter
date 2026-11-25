import { Upload } from 'lucide-react';

export type ActiveTab = 'pemindai' | 'arsip' | 'flutter';

interface AppHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  archiveCount: number;
  onTriggerUpload: () => void;
}

export function AppHeader({
  activeTab,
  onSelectTab,
  archiveCount,
  onTriggerUpload,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onSelectTab('pemindai')}
          className="font-display text-left text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700"
        >
          Pembaca Surat Otomatis
        </button>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7"
        >
          <button
            type="button"
            onClick={() => onSelectTab('pemindai')}
            aria-current={activeTab === 'pemindai' ? 'page' : undefined}
            className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700 ${
              activeTab === 'pemindai'
                ? 'text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemindai
            {activeTab === 'pemindai' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-700"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('arsip')}
            aria-current={activeTab === 'arsip' ? 'page' : undefined}
            className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700 ${
              activeTab === 'arsip'
                ? 'text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Riwayat Arsip</span>
            <span
              data-testid="header-archive-count"
              className="ml-1.5 font-mono text-xs tabular-nums text-slate-500"
            >
              ({archiveCount})
            </span>
            {activeTab === 'arsip' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-700"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('flutter')}
            aria-current={activeTab === 'flutter' ? 'page' : undefined}
            className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700 ${
              activeTab === 'flutter'
                ? 'text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kode Flutter
            {activeTab === 'flutter' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-700"
              />
            )}
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-800 whitespace-nowrap shrink-0 sm:gap-2 sm:px-4 sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
          >
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>Unggah Surat</span>
          </button>
        </div>
      </div>

      {/* Mobile secondary compact tab row (stays well under 15% viewport cap) */}
      <div className="flex border-t border-slate-100 bg-white px-2 md:hidden">
        <button
          type="button"
          onClick={() => onSelectTab('pemindai')}
          className={`flex-1 py-2.5 text-center text-xs font-medium whitespace-nowrap ${
            activeTab === 'pemindai'
              ? 'border-b-2 border-indigo-700 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Pemindai
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('arsip')}
          className={`flex-1 py-2.5 text-center text-xs font-medium whitespace-nowrap ${
            activeTab === 'arsip'
              ? 'border-b-2 border-indigo-700 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Arsip <span className="tabular-nums">({archiveCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('flutter')}
          className={`flex-1 py-2.5 text-center text-xs font-medium whitespace-nowrap ${
            activeTab === 'flutter'
              ? 'border-b-2 border-indigo-700 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Kode Flutter
        </button>
      </div>
    </header>
  );
}
