export const JENIS_SURAT_OPTIONS = [
  'Surat Undangan',
  'Surat Permohonan',
  'Surat Edaran',
  'Surat Tugas',
  'Surat Pemberitahuan',
  'Lainnya',
] as const;

export type JenisSurat = (typeof JENIS_SURAT_OPTIONS)[number];

export interface SuratFormValues {
  jenisSurat: JenisSurat;
  nomorSurat: string;
  tanggalSurat: string;
  perihal: string;
  pengirim: string;
  tujuan: string;
  lampiran: string;
  ringkasan: string;
  poinPenting: string;
}

export interface SuratArsipItem extends SuratFormValues {
  id: string;
  namaFile: string;
  mimeType: string;
  createdAt: string;
}

export const EMPTY_SURAT_FORM: SuratFormValues = {
  jenisSurat: 'Lainnya',
  nomorSurat: '',
  tanggalSurat: '',
  perihal: '',
  pengirim: '',
  tujuan: '',
  lampiran: '-',
  ringkasan: '',
  poinPenting: '',
};

const INDONESIAN_MONTHS: Record<string, string> = {
  januari: '01',
  jan: '01',
  februari: '02',
  feb: '02',
  pebruari: '02',
  maret: '03',
  mar: '03',
  april: '04',
  apr: '04',
  mei: '05',
  juni: '06',
  jun: '06',
  juli: '07',
  jul: '07',
  agustus: '08',
  agu: '08',
  agt: '08',
  september: '09',
  sep: '09',
  sept: '09',
  oktober: '10',
  okt: '10',
  november: '11',
  nov: '11',
  nopember: '11',
  nop: '11',
  desember: '12',
  des: '12',
};

export function normalizeJenisSurat(raw?: string | null): JenisSurat {
  if (!raw) return 'Lainnya';
  const cleaned = raw.trim().toLowerCase();
  for (const option of JENIS_SURAT_OPTIONS) {
    if (option.toLowerCase() === cleaned) {
      return option;
    }
  }
  if (cleaned.includes('undangan')) return 'Surat Undangan';
  if (cleaned.includes('permohonan')) return 'Surat Permohonan';
  if (cleaned.includes('edaran')) return 'Surat Edaran';
  if (cleaned.includes('tugas')) return 'Surat Tugas';
  if (cleaned.includes('pemberitahuan')) return 'Surat Pemberitahuan';
  return 'Lainnya';
}

export function normalizeTanggalDDMMYYYY(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-') return '';

  // Already DD-MM-YYYY or D-M-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}-${month}-${year}`;
  }

  // ISO YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Indonesian textual date e.g. "Jakarta, 14 November 2026" or "5 Mei 2026"
  const textMatch = trimmed
    .toLowerCase()
    .match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const monthName = textMatch[2];
    const year = textMatch[3];
    const month = INDONESIAN_MONTHS[monthName];
    if (month) {
      return `${day}-${month}-${year}`;
    }
  }

  return trimmed;
}

export function sanitizeLampiran(raw?: string | null): string {
  if (!raw) return '-';
  const trimmed = raw.trim();
  if (!trimmed) return '-';
  const lower = trimmed.toLowerCase();
  if (
    lower === 'tidak ada' ||
    lower === 'nihil' ||
    lower === 'kosong' ||
    lower === 'none' ||
    lower === 'n/a'
  ) {
    return '-';
  }
  return trimmed;
}

export function normalizeExtractedSurat(
  raw: Partial<Record<keyof SuratFormValues, unknown>>,
): SuratFormValues {
  const str = (val: unknown) => (typeof val === 'string' ? val.trim() : '');
  return {
    jenisSurat: normalizeJenisSurat(str(raw.jenisSurat)),
    nomorSurat: str(raw.nomorSurat),
    tanggalSurat: normalizeTanggalDDMMYYYY(str(raw.tanggalSurat)),
    perihal: str(raw.perihal),
    pengirim: str(raw.pengirim),
    tujuan: str(raw.tujuan),
    lampiran: sanitizeLampiran(str(raw.lampiran)),
    ringkasan: str(raw.ringkasan),
    poinPenting: str(raw.poinPenting),
  };
}

export function validateSuratForm(
  values: SuratFormValues,
): Partial<Record<keyof SuratFormValues, string>> {
  const errors: Partial<Record<keyof SuratFormValues, string>> = {};
  if (!values.perihal.trim()) {
    errors.perihal = 'Perihal atau judul surat wajib diisi.';
  }
  if (!values.pengirim.trim()) {
    errors.pengirim = 'Nama pengirim atau instansi asal wajib diisi.';
  }
  if (!values.ringkasan.trim()) {
    errors.ringkasan = 'Ringkasan isi surat wajib diisi.';
  }
  return errors;
}

export function formatSuratForClipboard(values: SuratFormValues): string {
  const nomor = values.nomorSurat.trim() || '-';
  const tanggal = values.tanggalSurat.trim() || '-';
  const perihal = values.perihal.trim() || '-';
  const pengirim = values.pengirim.trim() || '-';
  const ringkasan = values.ringkasan.trim() || '-';

  return [
    `*INFO SURAT (${values.jenisSurat})*`,
    `Nomor: ${nomor}`,
    `Tanggal: ${tanggal}`,
    `Perihal: ${perihal}`,
    `Pengirim: ${pengirim}`,
    `Ringkasan: ${ringkasan}`,
  ].join('\n');
}

export function filterSuratList(
  items: SuratArsipItem[],
  query: string,
  jenisFilter: string,
): SuratArsipItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesJenis =
      !jenisFilter || jenisFilter === 'Semua' || item.jenisSurat === jenisFilter;
    if (!matchesJenis) return false;
    if (!q) return true;
    return (
      item.nomorSurat.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      item.pengirim.toLowerCase().includes(q) ||
      item.tujuan.toLowerCase().includes(q)
    );
  });
}

function escapeCsvCell(value: string): string {
  const sanitized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export function generateCsvWithBom(items: SuratArsipItem[]): string {
  const headers = [
    'Jenis Surat',
    'Nomor Surat',
    'Tanggal Surat',
    'Perihal / Judul Surat',
    'Pengirim / Instansi Asal',
    'Tujuan / Penerima',
    'Lampiran',
    'Ringkasan Isi Surat',
    'Poin Penting / Tindak Lanjut',
    'Nama File',
    'Waktu Disimpan',
  ];

  const rows = items.map((item) =>
    [
      item.jenisSurat,
      item.nomorSurat || '-',
      item.tanggalSurat || '-',
      item.perihal,
      item.pengirim,
      item.tujuan || '-',
      item.lampiran || '-',
      item.ringkasan,
      item.poinPenting || '-',
      item.namaFile,
      item.createdAt,
    ]
      .map(escapeCsvCell)
      .join(','),
  );

  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export const SEED_ARSIP_SURAT: SuratArsipItem[] = [
  {
    id: 'seed-surat-1',
    jenisSurat: 'Surat Undangan',
    nomorSurat: '045/UND/DISKOMINFO/XI/2026',
    tanggalSurat: '18-11-2026',
    perihal: 'Undangan Rapat Koordinasi Implementasi Arsip Digital Daerah',
    pengirim: 'Dinas Komunikasi dan Informatika Kota Bandung',
    tujuan: 'Kepala Bagian Tata Usaha OPD Kota Bandung',
    lampiran: '1 (satu) berkas susunan acara',
    ringkasan:
      'Mengundang perwakilan kepala tata usaha seluruh OPD untuk menghadiri rapat koordinasi percepatan integrasi sistem tata naskah elektronik. Rapat akan membahas standar penamaan dokumen dan jadwal migrasi arsip triwulan IV.',
    poinPenting:
      'Pelaksanaan: Kamis, 26 November 2026 pukul 09.00 WIB di Ruang Rapat Lt. 3 Balai Kota. Wajib membawa daftar klasifikasi arsip masing-masing unit.',
    namaFile: 'undangan_rakor_diskominfo.pdf',
    mimeType: 'application/pdf',
    createdAt: '2026-11-19T08:30:00.000Z',
  },
  {
    id: 'seed-surat-2',
    jenisSurat: 'Surat Tugas',
    nomorSurat: '800.1.11.1/112/ST/BKPSDM/2026',
    tanggalSurat: '20-11-2026',
    perihal: 'Surat Tugas Pendampingan Audit Kearsipan Internal',
    pengirim: 'Badan Kepegawaian dan Pengembangan SDM Provinsi Jawa Barat',
    tujuan: 'Tim Pengelola Arsip dan Analis Kebijakan Muda',
    lampiran: '-',
    ringkasan:
      'Menugaskan tiga orang staf pengelola arsip untuk melakukan pendampingan audit kepatuhan kearsipan internal di lingkungan unit pelayanan terpadu. Penugasan berlaku selama tiga hari kerja penuh beserta kewajiban penyusunan berita acara.',
    poinPenting:
      'Periode tugas: 24–26 November 2026. Laporan hasil pendampingan diserahkan paling lambat 30 November 2026.',
    namaFile: 'surat_tugas_audit_2026.png',
    mimeType: 'image/png',
    createdAt: '2026-11-20T10:15:00.000Z',
  },
  {
    id: 'seed-surat-3',
    jenisSurat: 'Surat Permohonan',
    nomorSurat: '118/PMH/FTI-ITB/XI/2026',
    tanggalSurat: '22-11-2026',
    perihal: 'Permohonan Peminjaman Aula Utama untuk Seminar Nasional AI',
    pengirim: 'Fakultas Teknologi Industri - Institut Teknologi Nusantara',
    tujuan: 'Kepala Biro Umum dan Sarana Prasarana',
    lampiran: '1 (satu) proposal kegiatan',
    ringkasan:
      'Mengajukan permohonan izin penggunaan Aula Utama beserta perangkat audio visual untuk penyelenggaraan Seminar Nasional Kecerdasan Buatan Terapan. Pihak panitia menjamin kebersihan dan keamanan fasilitas selama acara berlangsung.',
    poinPenting:
      'Tanggal penggunaan: 10 Desember 2026 pukul 07.30–16.00 WIB. Konfirmasi ketersediaan ruangan diharapkan sebelum 1 Desember 2026.',
    namaFile: 'permohonan_peminjaman_aula.jpg',
    mimeType: 'image/jpeg',
    createdAt: '2026-11-22T14:05:00.000Z',
  },
];
