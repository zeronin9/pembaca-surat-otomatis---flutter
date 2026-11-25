export interface SampleSuratSpec {
  id: string;
  label: string;
  fileName: string;
  instansi: string;
  alamat: string;
  kotaTanggal: string;
  nomor: string;
  lampiran: string;
  perihal: string;
  kepada: string;
  paragraf: string[];
  detailWaktu?: string[];
  penandatanganJabatan: string;
  penandatanganNama: string;
}

export const SAMPLE_SURAT_SPECS: SampleSuratSpec[] = [
  {
    id: 'sample-undangan',
    label: 'Contoh Surat Undangan',
    fileName: 'contoh_surat_undangan_dinas.png',
    instansi: 'PEMERINTAH KOTA SURABAYA\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
    alamat: 'Jl. Jagir Wonokromo No. 354-356, Surabaya 60244 | Telp. (031) 8418904',
    kotaTanggal: 'Surabaya, 24 November 2026',
    nomor: '421.3/2894/436.7.1/2026',
    lampiran: '1 (Satu) Lembar Jadwal Acara',
    perihal: 'Undangan Sosialisasi Digitalisasi Arsip Sekolah Tahun 2026',
    kepada: 'Yth. Kepala SMP Negeri dan Swasta\nSe-Kota Surabaya\ndi Tempat',
    paragraf: [
      'Dengan hormat, dalam rangka percepatan tata kelola administrasi sekolah berbasis elektronik dan tertib kearsipan digital, kami mengundang Bapak/Ibu Kepala Sekolah untuk menghadiri kegiatan Sosialisasi Digitalisasi Arsip.',
      'Sehubungan dengan hal tersebut, kehadiran Bapak/Ibu sangat kami harapkan pada kegiatan yang akan dilaksanakan sesuai jadwal terlampir.',
      'Demikian surat undangan ini disampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.',
    ],
    detailWaktu: [
      'Hari / Tanggal : Kamis, 3 Desember 2026',
      'Waktu          : Pukul 08.30 - 12.30 WIB',
      'Tempat         : Aula Ki Hajar Dewantara, Lt. 2 Disdik Surabaya',
      'Catatan        : Membawa surat tugas dan laptop masing-masing',
    ],
    penandatanganJabatan: 'Kepala Dinas Pendidikan dan Kebudayaan,',
    penandatanganNama: 'Dr. H. Ahmad Fauzan, M.Pd.',
  },
  {
    id: 'sample-edaran',
    label: 'Contoh Surat Edaran',
    fileName: 'contoh_surat_edaran_perusahaan.png',
    instansi: 'PT NUSANTARA LOGISTIK TERPADU Tbk\nDIVISI SUMBER DAYA MANUSIA & UMUM',
    alamat: 'Menara Karya Lt. 14, Jl. H.R. Rasuna Said Blok X-5 Kav. 1-2, Jakarta Selatan 12950',
    kotaTanggal: 'Jakarta, 21 November 2026',
    nomor: '089/SE-HRD/NLT/XI/2026',
    lampiran: '-',
    perihal: 'Edaran Penyesuaian Jam Kerja & Cuti Bersama Akhir Tahun 2026',
    kepada: 'Kepada Yth.\nSeluruh Karyawan dan Pimpinan Unit Kerja\nPT Nusantara Logistik Terpadu Tbk',
    paragraf: [
      'Menindaklanjuti Keputusan Bersama Menteri mengenai Hari Libur Nasional dan Cuti Bersama Tahun 2026, Manajemen menetapkan penyesuaian jadwal operasional kantor pusat dan cabang regional.',
      'Seluruh unit layanan operasional diwajibkan menyusun daftar petugas piket paling lambat 10 Desember 2026 agar layanan distribusi pelanggan tetap berjalan lancar.',
      'Demikian surat edaran ini diterbitkan untuk menjadi perhatian dan dilaksanakan dengan penuh tanggung jawab.',
    ],
    detailWaktu: [
      'Periode Cuti Bersama : 24 Desember 2026 s.d. 26 Desember 2026',
      'Batas Pengajuan Piket: 10 Desember 2026 pukul 17.00 WIB ke Portal HR',
    ],
    penandatanganJabatan: 'Direktur Sumber Daya Manusia,',
    penandatanganNama: 'Rina Kusumawardhani, S.E., M.M.',
  },
];

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function createSampleSuratFile(spec: SampleSuratSpec): Promise<File> {
  const width = 992;
  const height = 1403;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Gagal menginisialisasi kanvas contoh surat.');
  }

  // Paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer subtle paper frame
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  const marginX = 88;
  const contentWidth = width - marginX * 2;
  let y = 92;

  // Kop Surat Header
  ctx.fillStyle = '#1E293B';
  ctx.textAlign = 'center';
  const instansiLines = spec.instansi.split('\n');
  instansiLines.forEach((line, idx) => {
    ctx.font = idx === 0 ? 'bold 24px Georgia, serif' : 'bold 28px Georgia, serif';
    ctx.fillText(line, width / 2, y);
    y += 34;
  });

  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(spec.alamat, width / 2, y);
  y += 22;

  // Double horizontal kop line
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(marginX, y);
  ctx.lineTo(width - marginX, y);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, y + 6);
  ctx.lineTo(width - marginX, y + 6);
  ctx.stroke();

  y += 48;

  // Date right-aligned
  ctx.textAlign = 'right';
  ctx.fillStyle = '#111827';
  ctx.font = '17px Georgia, serif';
  ctx.fillText(spec.kotaTanggal, width - marginX, y);
  y += 36;

  // Metadata left-aligned
  ctx.textAlign = 'left';
  const drawMeta = (label: string, val: string, bold = false) => {
    ctx.font = '17px Georgia, serif';
    ctx.fillStyle = '#111827';
    ctx.fillText(label, marginX, y);
    ctx.fillText(':', marginX + 108, y);
    ctx.font = bold ? 'bold 17px Georgia, serif' : '17px Georgia, serif';
    const lines = wrapTextLines(ctx, val, contentWidth - 130);
    lines.forEach((line, idx) => {
      ctx.fillText(line, marginX + 126, y + idx * 26);
    });
    y += Math.max(1, lines.length) * 28;
  };

  drawMeta('Nomor', spec.nomor);
  drawMeta('Lampiran', spec.lampiran);
  drawMeta('Perihal', spec.perihal, true);
  y += 24;

  // Recipient block
  ctx.font = '17px Georgia, serif';
  spec.kepada.split('\n').forEach((line) => {
    ctx.fillText(line, marginX, y);
    y += 26;
  });
  y += 28;

  // Body paragraphs
  spec.paragraf.forEach((para, pIndex) => {
    const lines = wrapTextLines(ctx, para, contentWidth);
    lines.forEach((line) => {
      ctx.fillText(line, marginX, y);
      y += 28;
    });
    y += 16;

    if (pIndex === 0 && spec.detailWaktu && spec.detailWaktu.length > 0) {
      y += 6;
      ctx.font = 'bold 16px "Courier New", monospace';
      spec.detailWaktu.forEach((detail) => {
        ctx.fillText(detail, marginX + 24, y);
        y += 28;
      });
      ctx.font = '17px Georgia, serif';
      y += 16;
    }
  });

  y += 42;

  // Signature block on the right
  const sigX = width - marginX - 310;
  ctx.font = '17px Georgia, serif';
  ctx.fillText(spec.penandatanganJabatan, sigX, y);
  y += 96;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(spec.penandatanganNama, sigX, y);

  // Subtle stamp circle
  ctx.strokeStyle = 'rgba(30, 64, 175, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sigX - 24, y - 48, 42, 0, Math.PI * 2);
  ctx.stroke();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Gagal membuat gambar contoh.'))),
      'image/png',
    );
  });

  return new File([blob], spec.fileName, { type: 'image/png' });
}
