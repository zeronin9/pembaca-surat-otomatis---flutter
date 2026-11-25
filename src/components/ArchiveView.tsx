import { useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Eye,
  Inbox,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  JENIS_SURAT_OPTIONS,
  type SuratArsipItem,
  filterSuratList,
  generateCsvWithBom,
} from '../utils/surat';

interface ArchiveViewProps {
  items: SuratArsipItem[];
  onDelete: (id: string) => void;
  onCopy: (item: SuratArsipItem) => void;
  onGoToScanner: () => void;
  onExportSuccess: (count: number) => void;
}

export function ArchiveView({
  items,
  onDelete,
  onCopy,
  onGoToScanner,
  onExportSuccess,
}: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('Semua');
  const [detailItem, setDetailItem] = useState<SuratArsipItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SuratArsipItem | null>(null);

  const filteredItems = useMemo(
    () => filterSuratList(items, searchQuery, jenisFilter),
    [items, searchQuery, jenisFilter],
  );

  const handleExportCsv = () => {
    const source = filteredItems.length > 0 ? filteredItems : items;
    if (source.length === 0) return;

    const csvContent = generateCsvWithBom(source);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `arsip_surat_${dateStamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    onExportSuccess(source.length);
  };

  const filterTabs = ['Semua', ...JENIS_SURAT_OPTIONS];

  return (
    <section className="mx-auto max-w-[1360px] py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Arsip Surat
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Menampilkan{' '}
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {filteredItems.length}
            </span>{' '}
            dari{' '}
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {items.length}
            </span>{' '}
            surat tersimpan di penyimpanan lokal perangkat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={items.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700"
        >
          <Download className="h-4 w-4 text-indigo-700" aria-hidden="true" />
          <span>Export ke CSV</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <label htmlFor="archive-search-input" className="sr-only">
            Cari Nomor Surat, Perihal, atau Pengirim
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="archive-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Nomor Surat, Perihal, atau Pengirim..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>

        <div
          role="group"
          aria-label="Filter berdasarkan jenis surat"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {filterTabs.map((jenis) => {
            const active = jenisFilter === jenis;
            return (
              <button
                key={jenis}
                type="button"
                onClick={() => setJenisFilter(jenis)}
                aria-pressed={active}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-700 ${
                  active
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {jenis}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-semibold text-slate-900">
            Arsip Surat Masih Kosong
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            Unggah dan analisis dokumen surat pertama Anda pada halaman Pemindai untuk menyimpannya di sini.
          </p>
          <button
            type="button"
            onClick={onGoToScanner}
            className="mt-5 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
          >
            Buka Pemindai Surat
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">
            Tidak ada surat yang cocok dengan kata kunci atau filter yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setJenisFilter('Semua');
            }}
            className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
          >
            Atur ulang pencarian dan filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop DataTable */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3.5">Jenis &amp; Nomor Surat</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Perihal / Judul Surat</th>
                  <th className="px-4 py-3.5">Pengirim / Instansi</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <div className="text-xs font-medium text-indigo-700">
                        {item.jenisSurat}
                      </div>
                      <div className="mt-0.5 font-mono text-xs tabular-nums text-slate-600">
                        {item.nomorSurat || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top font-mono text-xs tabular-nums text-slate-700 whitespace-nowrap">
                      {item.tanggalSurat || '-'}
                    </td>
                    <td className="max-w-md px-4 py-3.5 align-top">
                      <div className="font-medium text-slate-900">
                        {item.perihal}
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {item.ringkasan}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 align-top text-slate-700">
                      {item.pengirim}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          aria-label={`Detail surat ${item.perihal}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Hapus surat ${item.perihal}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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

          {/* Mobile / Tablet Card List */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-700">
                    {item.jenisSurat}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {item.nomorSurat || 'Tanpa Nomor'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {item.tanggalSurat || '-'}
                  </span>
                </div>

                <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                  {item.perihal}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  Pengirim: {item.pengirim}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {item.ringkasan}
                </p>

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    aria-label={`Detail surat ${item.perihal}`}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Detail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Hapus surat ${item.perihal}`}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Hapus</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-semibold text-indigo-700">
                  {detailItem.jenisSurat}
                  {detailItem.tanggalSurat ? ` · ${detailItem.tanggalSurat}` : ''}
                </div>
                <h2
                  id="detail-modal-title"
                  className="mt-1 font-display text-lg font-bold text-slate-900"
                >
                  {detailItem.perihal}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                aria-label="Tutup detail surat"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Nomor Surat</dt>
                <dd className="mt-0.5 font-mono text-slate-900">
                  {detailItem.nomorSurat || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Tanggal Surat</dt>
                <dd className="mt-0.5 font-mono tabular-nums text-slate-900">
                  {detailItem.tanggalSurat || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Pengirim / Instansi Asal
                </dt>
                <dd className="mt-0.5 text-slate-900">{detailItem.pengirim}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Tujuan / Penerima
                </dt>
                <dd className="mt-0.5 text-slate-900">{detailItem.tujuan || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Lampiran</dt>
                <dd className="mt-0.5 text-slate-900">{detailItem.lampiran || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Nama File</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-slate-700">
                  {detailItem.namaFile}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">
                  Ringkasan Isi Surat
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-800">
                  {detailItem.ringkasan}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">
                  Poin Penting / Tindak Lanjut
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-800">
                  {detailItem.poinPenting || '-'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onCopy(detailItem)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Salin Info Surat</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded-xl bg-indigo-700 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <h2
              id="delete-dialog-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Hapus Surat dari Arsip?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Surat <strong className="text-slate-900">"{deleteTarget.perihal}"</strong> akan
              dihapus secara permanen dari arsip lokal Anda.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
