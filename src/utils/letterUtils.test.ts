import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUploadFile,
  normalizeDateToDDMMYYYY,
  normalizeJenisSurat,
  normalizeLetterExtraction,
  formatWhatsAppSummary,
  filterLetters,
  SEED_ARCHIVED_LETTERS,
} from './letterUtils';

test('validateUploadFile accepts supported PDF and image formats within size limit', () => {
  const pdfResult = validateUploadFile({
    name: 'surat-resmi.PDF',
    type: 'application/pdf',
    size: 1024 * 500,
  });
  assert.equal(pdfResult.valid, true);

  const imgResult = validateUploadFile({
    name: 'scan-surat.webp',
    type: 'image/webp',
    size: 2048,
  });
  assert.equal(imgResult.valid, true);
});

test('validateUploadFile rejects unsupported files, empty files, and oversized files', () => {
  const docx = validateUploadFile({
    name: 'surat.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024,
  });
  assert.equal(docx.valid, false);

  const empty = validateUploadFile({
    name: 'empty.pdf',
    type: 'application/pdf',
    size: 0,
  });
  assert.equal(empty.valid, false);

  const huge = validateUploadFile({
    name: 'huge.pdf',
    type: 'application/pdf',
    size: 20 * 1024 * 1024,
  });
  assert.equal(huge.valid, false);
});

test('normalizeDateToDDMMYYYY converts ISO, slash, and Indonesian month formats', () => {
  assert.equal(normalizeDateToDDMMYYYY('2026-11-16'), '16-11-2026');
  assert.equal(normalizeDateToDDMMYYYY('5/3/2026'), '05-03-2026');
  assert.equal(normalizeDateToDDMMYYYY('Jakarta, 8 Mei 2026'), '08-05-2026');
  assert.equal(normalizeDateToDDMMYYYY('12-11-2026'), '12-11-2026');
});

test('normalizeJenisSurat maps exact and partial labels safely', () => {
  assert.equal(normalizeJenisSurat('Surat Undangan'), 'Surat Undangan');
  assert.equal(normalizeJenisSurat('surat tugas dinas'), 'Surat Tugas');
  assert.equal(normalizeJenisSurat('Memo Internal'), 'Lainnya');
});

test('normalizeLetterExtraction fills defaults and preserves cleaned fields', () => {
  const normalized = normalizeLetterExtraction({
    jenisSurat: 'Surat Pemberitahuan',
    nomorSurat: ' 001/PEMBERITAHUAN/2026 ',
    tanggalSurat: '2026-11-16',
    perihal: ' Pemberitahuan Libur Nasional ',
    pengirim: ' Bagian HRD ',
    tujuan: ' Seluruh Karyawan ',
    lampiran: '',
    ringkasan: ' Kantor akan libur pada tanggal 17 November 2026. ',
    poinPenting: ' Operasional kembali normal pada 18 November 2026. ',
  });

  assert.equal(normalized.jenisSurat, 'Surat Pemberitahuan');
  assert.equal(normalized.nomorSurat, '001/PEMBERITAHUAN/2026');
  assert.equal(normalized.tanggalSurat, '16-11-2026');
  assert.equal(normalized.lampiran, '-');
});

test('formatWhatsAppSummary formats clean shareable text', () => {
  const text = formatWhatsAppSummary(SEED_ARCHIVED_LETTERS[0]);
  assert.match(text, /\*INFO SURAT \(Surat Undangan\)\*/);
  assert.match(text, /Nomor: 045\/UND\/DISKOMINFO\/XI\/2026/);
  assert.match(text, /Tanggal: 12-11-2026/);
  assert.match(text, /\*Ringkasan:\*/);
  assert.match(text, /\*Poin Penting \/ Tindak Lanjut:\*/);
});

test('filterLetters filters by query across nomor, perihal, pengirim and jenisSurat', () => {
  const byQuery = filterLetters(SEED_ARCHIVED_LETTERS, 'bandung', 'Semua');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'arsip-001');

  const byNomor = filterLetters(SEED_ARCHIVED_LETTERS, 'SE-18', 'Semua');
  assert.equal(byNomor.length, 1);
  assert.equal(byNomor[0].id, 'arsip-002');

  const byJenis = filterLetters(SEED_ARCHIVED_LETTERS, '', 'Surat Permohonan');
  assert.equal(byJenis.length, 1);
  assert.equal(byJenis[0].id, 'arsip-003');
});
