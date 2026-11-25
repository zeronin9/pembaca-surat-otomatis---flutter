import { FileText, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../utils/theme';

interface HeaderProps {
  totalLetters: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Header({ totalLetters, theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          <FileText
            className="h-5 w-5 text-blue-700 dark:text-blue-400 shrink-0"
            aria-hidden="true"
          />
          <span>Pembaca Surat Otomatis</span>
        </a>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div
            data-testid="archive-counter"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0"
          >
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 hidden sm:inline">
              Arsip Tersimpan:
            </span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {totalLetters}
            </span>
            <span className="ml-1 text-slate-600 dark:text-slate-400">Surat</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            aria-pressed={isDark}
            data-testid="theme-toggle"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                <span className="hidden sm:inline">Mode Gelap</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
