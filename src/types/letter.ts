export type JenisSurat =
  | 'Surat Undangan'
  | 'Surat Permohonan'
  | 'Surat Edaran'
  | 'Surat Tugas'
  | 'Surat Pemberitahuan'
  | 'Lainnya';

export interface ExtractedLetterData {
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

export interface ArchivedLetter extends ExtractedLetterData {
  id: string;
  namaFile: string;
  mimeType?: string;
  hasAttachment?: boolean;
  savedAt: string;
}

export interface UploadedDocument {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
  isPdf: boolean;
}
