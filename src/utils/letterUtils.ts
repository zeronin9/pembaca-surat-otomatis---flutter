import type { ArchivedLetter, ExtractedLetterData, JenisSurat } from '../types/letter';

export const JENIS_SURAT_OPTIONS: JenisSurat[] = [
  'Surat Undangan',
  'Surat Permohonan',
  'Surat Edaran',
  'Surat Tugas',
  'Surat Pemberitahuan',
  'Lainnya',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'] as const;

export function createEmptyLetterData(): ExtractedLetterData {
  return {
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
}

export function validateUploadFile(file: {
  name: string;
  type: string;
  size: number;
}): { valid: true; normalizedMimeType: string } | { valid: false; error: string } {
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const mime = (file.type || '').toLowerCase();

  let resolvedMime = mime;
  if (!resolvedMime || resolvedMime === 'application/octet-stream') {
    if (lowerName.endsWith('.pdf')) resolvedMime = 'application/pdf';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) resolvedMime = 'image/jpeg';
    else if (lowerName.endsWith('.png')) resolvedMime = 'image/png';
    else if (lowerName.endsWith('.webp')) resolvedMime = 'image/webp';
  }

  const isSupportedMime = (ACCEPTED_MIME_TYPES as readonly string[]).includes(resolvedMime);

  if (!hasValidExt && !isSupportedMime) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Gunakan file PDF (.pdf) atau gambar (.jpg, .jpeg, .png, .webp).',
    };
  }

  if (!isSupportedMime) {
    return {
      valid: false,
      error: 'Tipe MIME file tidak dikenali. Pastikan file berformat PDF, JPG, PNG, atau WEBP yang valid.',
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: 'File kosong atau rusak. Silakan pilih file dokumen yang valid.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran file melebihi batas maksimal 15 MB. Silakan kompres file terlebih dahulu.',
    };
  }

  return { valid: true, normalizedMimeType: resolvedMime };
}

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
  desember: '12',
  des: '12',
};

export function normalizeDateToDDMMYYYY(rawDate: string | undefined | null): string {
  if (!rawDate) return '';
  const trimmed = rawDate.trim();
  if (!trimmed || trimmed === '-') return trimmed;

  // Already DD-MM-YYYY
  const ddmmyyyyDash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDash) {
    const [, d, m, y] = ddmmyyyyDash;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // DD/MM/YYYY or DD.MM.YYYY
  const ddmmyyyySlash = trimmed.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (ddmmyyyySlash) {
    const [, d, m, y] = ddmmyyyySlash;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  // Indonesian textual date e.g. "16 November 2026" or "Jakarta, 5 Mei 2026"
  const indoMatch = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (indoMatch) {
    const [, d, monthWord, y] = indoMatch;
    const monthNum = INDONESIAN_MONTHS[monthWord.toLowerCase()];
    if (monthNum) {
      return `${d.padStart(2, '0')}-${monthNum}-${y}`;
    }
  }

  return trimmed;
}

export function normalizeJenisSurat(raw: string | undefined | null): JenisSurat {
  if (!raw) return 'Lainnya';
  const cleaned = raw.trim().toLowerCase();
  const exact = JENIS_SURAT_OPTIONS.find((opt) => opt.toLowerCase() === cleaned);
  if (exact) return exact;

  if (cleaned.includes('undangan')) return 'Surat Undangan';
  if (cleaned.includes('permohonan')) return 'Surat Permohonan';
  if (cleaned.includes('edaran')) return 'Surat Edaran';
  if (cleaned.includes('tugas')) return 'Surat Tugas';
  if (cleaned.includes('pemberitahuan')) return 'Surat Pemberitahuan';
  return 'Lainnya';
}

export function normalizeLetterExtraction(
  raw: Partial<Record<keyof ExtractedLetterData, unknown>> | null | undefined,
): ExtractedLetterData {
  const str = (val: unknown) => (typeof val === 'string' ? val.trim() : '');
  const lampiranRaw = str(raw?.lampiran);

  return {
    jenisSurat: normalizeJenisSurat(str(raw?.jenisSurat)),
    nomorSurat: str(raw?.nomorSurat),
    tanggalSurat: normalizeDateToDDMMYYYY(str(raw?.tanggalSurat)),
    perihal: str(raw?.perihal),
    pengirim: str(raw?.pengirim),
    tujuan: str(raw?.tujuan),
    lampiran: lampiranRaw.length > 0 ? lampiranRaw : '-',
    ringkasan: str(raw?.ringkasan),
    poinPenting: str(raw?.poinPenting),
  };
}

export function formatWhatsAppSummary(data: ExtractedLetterData): string {
  const lines = [
    `*INFO SURAT (${data.jenisSurat || 'Lainnya'})*`,
    `Nomor: ${data.nomorSurat.trim() || '-'}`,
    `Tanggal: ${data.tanggalSurat.trim() || '-'}`,
    `Perihal: ${data.perihal.trim() || '-'}`,
    `Pengirim: ${data.pengirim.trim() || '-'}`,
    `Tujuan: ${data.tujuan.trim() || '-'}`,
    `Lampiran: ${data.lampiran.trim() || '-'}`,
    '',
    `*Ringkasan:*`,
    data.ringkasan.trim() || '-',
  ];

  if (data.poinPenting.trim()) {
    lines.push('', `*Poin Penting / Tindak Lanjut:*`, data.poinPenting.trim());
  }

  return lines.join('\n');
}

export function filterLetters(
  letters: ArchivedLetter[],
  query: string,
  jenisFilter: string,
): ArchivedLetter[] {
  const q = query.trim().toLowerCase();
  return letters.filter((item) => {
    const matchesJenis = !jenisFilter || jenisFilter === 'Semua' || item.jenisSurat === jenisFilter;
    if (!matchesJenis) return false;
    if (!q) return true;

    return (
      item.nomorSurat.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      item.pengirim.toLowerCase().includes(q)
    );
  });
}

export const SEED_ARCHIVED_LETTERS: ArchivedLetter[] = [
  {
    id: 'arsip-001',
    jenisSurat: 'Surat Undangan',
    nomorSurat: '045/UND/DISKOMINFO/XI/2026',
    tanggalSurat: '12-11-2026',
    perihal: 'Undangan Rapat Koordinasi Implementasi Arsip Digital Daerah',
    pengirim: 'Dinas Komunikasi dan Informatika Kota Bandung',
    tujuan: 'Kepala Bagian Umum & Tata Usaha OPD',
    lampiran: '1 Berkas Susunan Acara',
    ringkasan:
      'Dinas Komunikasi dan Informatika mengundang seluruh Kepala Bagian Umum OPD untuk menghadiri rapat koordinasi percepatan implementasi tata naskah dinas elektronik dan integrasi arsip surat masuk.',
    poinPenting:
      'Jadwal: Kamis, 19 November 2026 pukul 09.00 WIB di Ruang Rapat Utama Gedung Balaikota. Harap membawa rekapitulasi jumlah surat triwulan III.',
    namaFile: 'undangan-rakor-arsip-2026.pdf',
    savedAt: '2026-11-12T08:30:00.000Z',
  },
  {
    id: 'arsip-002',
    jenisSurat: 'Surat Edaran',
    nomorSurat: 'SE-18/SETDA/XI/2026',
    tanggalSurat: '09-11-2026',
    perihal: 'Penyesuaian Jam Kerja dan Pengelolaan Dokumen Akhir Tahun Anggaran',
    pengirim: 'Sekretariat Daerah Provinsi Jawa Barat',
    tujuan: 'Seluruh Kepala Unit Kerja dan Pegawai',
    lampiran: '-',
    ringkasan:
      'Surat edaran ini menetapkan pedoman penyelesaian administrasi surat-menyurat serta batas akhir pengajuan dokumen pertanggungjawaban keuangan sebelum penutupan tahun anggaran 2026.',
    poinPenting:
      'Batas akhir pengajuan berkas fisik dan digital adalah tanggal 18 Desember 2026 pukul 15.00 WIB melalui loket tata usaha.',
    namaFile: 'surat-edaran-akhir-tahun.png',
    savedAt: '2026-11-09T14:15:00.000Z',
  },
  {
    id: 'arsip-003',
    jenisSurat: 'Surat Permohonan',
    nomorSurat: '112/PMH/PT-NUSANTARA/XI/2026',
    tanggalSurat: '05-11-2026',
    perihal: 'Permohonan Izin Peminjaman Aula Serbaguna untuk Pelatihan Kearsipan',
    pengirim: 'PT Nusantara Arsip Sejahtera',
    tujuan: 'Kepala Biro Umum dan Perlengkapan',
    lampiran: '2 Lembar Proposal Kegiatan',
    ringkasan:
      'PT Nusantara Arsip Sejahtera mengajukan permohonan izin penggunaan Aula Serbaguna Lantai 3 untuk penyelenggaraan bimbingan teknis digitalisasi dokumen perkantoran bagi 60 peserta.',
    poinPenting:
      'Rencana pelaksanaan pada tanggal 25–26 November 2026. Konfirmasi ketersediaan ruangan dimohon paling lambat 18 November 2026.',
    namaFile: 'permohonan-peminjaman-aula.jpg',
    savedAt: '2026-11-05T10:00:00.000Z',
  },
];
