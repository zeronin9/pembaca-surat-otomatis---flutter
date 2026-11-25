import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSuratList,
  formatSuratForClipboard,
  generateCsvWithBom,
  normalizeExtractedSurat,
  normalizeJenisSurat,
  normalizeTanggalDDMMYYYY,
  sanitizeLampiran,
  SEED_ARSIP_SURAT,
  validateSuratForm,
} from './surat';

test('normalizeTanggalDDMMYYYY converts ISO, slash, and Indonesian month names to DD-MM-YYYY', () => {
  assert.equal(normalizeTanggalDDMMYYYY('2026-11-14'), '14-11-2026');
  assert.equal(normalizeTanggalDDMMYYYY('5/3/2026'), '05-03-2026');
  assert.equal(normalizeTanggalDDMMYYYY('Jakarta, 24 November 2026'), '24-11-2026');
  assert.equal(normalizeTanggalDDMMYYYY('1 Agustus 2025'), '01-08-2025');
  assert.equal(normalizeTanggalDDMMYYYY('18-11-2026'), '18-11-2026');
  assert.equal(normalizeTanggalDDMMYYYY('-'), '');
});

test('normalizeJenisSurat maps variants and defaults unknown values to Lainnya', () => {
  assert.equal(normalizeJenisSurat('Surat Undangan'), 'Surat Undangan');
  assert.equal(normalizeJenisSurat('undangan rapat'), 'Surat Undangan');
  assert.equal(normalizeJenisSurat('Surat Tugas Dinas'), 'Surat Tugas');
  assert.equal(normalizeJenisSurat('Memo Internal'), 'Lainnya');
});

test('sanitizeLampiran defaults empty or nihil strings to dash', () => {
  assert.equal(sanitizeLampiran(''), '-');
  assert.equal(sanitizeLampiran('Tidak ada'), '-');
  assert.equal(sanitizeLampiran('Nihil'), '-');
  assert.equal(sanitizeLampiran('2 berkas'), '2 berkas');
});

test('normalizeExtractedSurat normalizes raw Gemini payload safely', () => {
  const result = normalizeExtractedSurat({
    jenisSurat: 'surat edaran',
    nomorSurat: ' 001/SE/2026 ',
    tanggalSurat: '2026-05-09',
    perihal: 'Libur Nasional',
    pengirim: 'Sekretariat Daerah',
    tujuan: 'Seluruh Pegawai',
    lampiran: 'tidak ada',
    ringkasan: 'Pemberitahuan hari libur resmi.',
    poinPenting: 'Masuk kembali tanggal 11-05-2026.',
  });

  assert.equal(result.jenisSurat, 'Surat Edaran');
  assert.equal(result.nomorSurat, '001/SE/2026');
  assert.equal(result.tanggalSurat, '09-05-2026');
  assert.equal(result.lampiran, '-');
});

test('validateSuratForm requires perihal, pengirim, and ringkasan', () => {
  const invalid = validateSuratForm({
    jenisSurat: 'Lainnya',
    nomorSurat: '',
    tanggalSurat: '',
    perihal: '',
    pengirim: '',
    tujuan: '',
    lampiran: '-',
    ringkasan: '',
    poinPenting: '',
  });
  assert.ok(invalid.perihal);
  assert.ok(invalid.pengirim);
  assert.ok(invalid.ringkasan);

  const valid = validateSuratForm({
    jenisSurat: 'Surat Undangan',
    nomorSurat: '01/A',
    tanggalSurat: '24-11-2026',
    perihal: 'Rapat Tahunan',
    pengirim: 'Direktorat Operasional',
    tujuan: 'Kepala Divisi',
    lampiran: '-',
    ringkasan: 'Undangan rapat evaluasi tahunan.',
    poinPenting: '',
  });
  assert.deepEqual(valid, {});
});

test('formatSuratForClipboard formats WhatsApp/email ready summary', () => {
  const formatted = formatSuratForClipboard(SEED_ARSIP_SURAT[0]);
  assert.match(formatted, /\*INFO SURAT \(Surat Undangan\)\*/);
  assert.match(formatted, /Nomor: 045\/UND\/DISKOMINFO\/XI\/2026/);
  assert.match(formatted, /Tanggal: 18-11-2026/);
  assert.match(formatted, /Pengirim: Dinas Komunikasi dan Informatika Kota Bandung/);
});

test('filterSuratList filters by query and jenisSurat simultaneously', () => {
  const byQuery = filterSuratList(SEED_ARSIP_SURAT, 'DISKOMINFO', 'Semua');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'seed-surat-1');

  const byJenis = filterSuratList(SEED_ARSIP_SURAT, '', 'Surat Tugas');
  assert.equal(byJenis.length, 1);
  assert.equal(byJenis[0].id, 'seed-surat-2');

  const combinedMismatch = filterSuratList(SEED_ARSIP_SURAT, 'DISKOMINFO', 'Surat Tugas');
  assert.equal(combinedMismatch.length, 0);
});

test('generateCsvWithBom includes UTF-8 BOM and properly escapes commas/quotes', () => {
  const csv = generateCsvWithBom([
    {
      ...SEED_ARSIP_SURAT[0],
      perihal: 'Undangan Rapat, Koordinasi "Penting"',
    },
  ]);
  assert.equal(csv.startsWith('\uFEFF'), true);
  assert.match(csv, /"Undangan Rapat, Koordinasi ""Penting"""/);
  assert.match(csv, /Jenis Surat,Nomor Surat,Tanggal Surat/);
});
