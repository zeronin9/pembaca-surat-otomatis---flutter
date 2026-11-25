import { useMemo, useState } from 'react';
import { Eye, FileSpreadsheet, Search, Trash2 } from 'lucide-react';
import type { ArchivedLetter } from '../types/letter';
import {
  filterLetters,
  JENIS_SURAT_OPTIONS,
} from '../utils/letterUtils';

interface ArchiveTableProps {
  letters: ArchivedLetter[];
  onViewDetail: (letter: ArchivedLetter) => void;
  onDelete: (id: string) => void;
}

export function ArchiveTable({ letters, onViewDetail, onDelete }: ArchiveTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState('Semua');

  const filteredLetters = useMemo(
    () => filterLetters(letters, searchQuery, jenisFilter),
    [letters, searchQuery, jenisFilter],
  );

  return (
    <section
      id="arsip-surat"
      aria-labelledby="archive-section-title"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            id="archive-section-title"
            className="text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Riwayat Arsip Surat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            Menampilkan {filteredLetters.length} dari {letters.length} surat tersimpan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nomor, Perihal, atau Pengirim..."
              aria-label="Cari surat berdasarkan Nomor Surat, Perihal, atau Pengirim"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            aria-label="Filter berdasarkan Jenis Surat"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Semua">Semua Jenis Surat</option>
            {JENIS_SURAT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Belum ada surat tersimpan di arsip
          </p>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            Unggah dokumen surat di bagian atas, periksa hasil ekstraksi AI, lalu tekan &ldquo;Simpan ke Arsip&rdquo; untuk mencatat surat pertama Anda.
          </p>
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tidak ada surat yang sesuai dengan pencarian
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Coba ubah kata kunci pencarian atau pilih filter jenis surat lainnya.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setJenisFilter('Semua');
            }}
            className="mt-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Reset Pencarian &amp; Filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Tanggal
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Nomor Surat
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Jenis Surat
                </th>
                <th scope="col" className="px-4 py-3 min-w-[240px]">
                  Perihal / Judul
                </th>
                <th scope="col" className="px-4 py-3 min-w-[180px]">
                  Pengirim
                </th>
                <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLetters.map((letter) => (
                <tr
                  key={letter.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {letter.tanggalSurat || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {letter.nomorSurat || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {letter.jenisSurat}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    <div className="line-clamp-2">{letter.perihal || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    <div className="line-clamp-2">{letter.pengirim || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(letter)}
                        aria-label={`Detail surat ${letter.perihal || letter.nomorSurat}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Eye
                          className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
                          aria-hidden="true"
                        />
                        <span>Detail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(letter.id)}
                        aria-label={`Hapus surat ${letter.perihal || letter.nomorSurat}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
