import { GoogleGenAI, Type } from '@google/genai';
import {
  ACCEPTED_MIME_TYPES,
  normalizeLetterExtraction,
} from '../src/utils/letterUtils.js';

const EXTRACTION_PROMPT = `Anda adalah asisten administrasi dan kearsipan profesional berbahasa Indonesia.
Tugas Anda adalah membaca dokumen surat resmi atau tidak resmi (PDF atau gambar hasil scan/foto) dan mengekstrak seluruh metadata serta isi pentingnya secara akurat dalam bahasa Indonesia yang baku dan jelas.

Aturan ekstraksi:
1. jenisSurat: Pilih salah satu yang paling sesuai dari daftar tepat berikut: "Surat Undangan", "Surat Permohonan", "Surat Edaran", "Surat Tugas", "Surat Pemberitahuan", atau "Lainnya".
2. nomorSurat: Salin nomor surat persis seperti yang tertulis pada dokumen. Jika tidak ditemukan, isi "-".
3. tanggalSurat: Konversi tanggal surat ke format DD-MM-YYYY (contoh: 16-11-2026). Jika tidak tertera sama sekali, isi "-".
4. perihal: Tulis perihal atau judul utama surat secara ringkas dan jelas.
5. pengirim: Tulis nama instansi, organisasi, atau pihak pengirim surat.
6. tujuan: Tulis pihak penerima atau tujuan surat (jika ada beberapa, ringkas dengan jelas).
7. lampiran: Tulis keterangan lampiran yang tertera pada surat, atau isi "-" jika tidak ada lampiran.
8. ringkasan: Tulis 2 hingga 3 kalimat padat dan informatif yang menjelaskan inti maksud surat.
9. poinPenting: Tulis jadwal acara (hari, tanggal, waktu, tempat), tenggat waktu, nominal penting, atau instruksi tindak lanjut khusus yang tercantum. Jika tidak ada, isi "-".`;

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ExtractLetterInput {
  base64Data?: unknown;
  mimeType?: unknown;
  fileName?: unknown;
}

export async function extractLetterFromPayload(
  input: ExtractLetterInput,
): Promise<{ status: number; body: Record<string, unknown> }> {
  try {
    const { base64Data, mimeType, fileName } = input ?? {};

    if (!base64Data || typeof base64Data !== 'string') {
      return {
        status: 400,
        body: {
          error: 'Data file tidak ditemukan. Silakan unggah ulang dokumen surat.',
        },
      };
    }

    if (
      !mimeType ||
      typeof mimeType !== 'string' ||
      !(ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType)
    ) {
      return {
        status: 400,
        body: {
          error: 'Format dokumen tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.',
        },
      };
    }

    const ai = createGeminiClient();
    if (!ai) {
      return {
        status: 503,
        body: {
          error:
            'Kunci API Gemini belum dikonfigurasi pada server (GEMINI_API_KEY). Anda tetap dapat mengisi form ekstraksi secara manual di panel kanan.',
        },
      };
    }

    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `${EXTRACTION_PROMPT}\n\nNama file yang diunggah: ${typeof fileName === 'string' ? fileName : 'dokumen-surat'}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jenisSurat: {
              type: Type.STRING,
              enum: [
                'Surat Undangan',
                'Surat Permohonan',
                'Surat Edaran',
                'Surat Tugas',
                'Surat Pemberitahuan',
                'Lainnya',
              ],
              description: 'Kategori jenis surat.',
            },
            nomorSurat: {
              type: Type.STRING,
              description: 'Nomor surat resmi yang tertera, atau "-" jika tidak ada.',
            },
            tanggalSurat: {
              type: Type.STRING,
              description: 'Tanggal surat dalam format DD-MM-YYYY, atau "-" jika tidak tertera.',
            },
            perihal: {
              type: Type.STRING,
              description: 'Perihal atau judul utama surat.',
            },
            pengirim: {
              type: Type.STRING,
              description: 'Nama instansi, perusahaan, atau pengirim surat.',
            },
            tujuan: {
              type: Type.STRING,
              description: 'Nama atau jabatan pihak tujuan / penerima surat.',
            },
            lampiran: {
              type: Type.STRING,
              description: 'Keterangan lampiran pada surat, isi "-" jika tidak ada.',
            },
            ringkasan: {
              type: Type.STRING,
              description: 'Ringkasan isi surat dalam 2-3 kalimat padat dan jelas.',
            },
            poinPenting: {
              type: Type.STRING,
              description: 'Jadwal acara, tenggat waktu, atau instruksi tindak lanjut khusus.',
            },
          },
          required: [
            'jenisSurat',
            'nomorSurat',
            'tanggalSurat',
            'perihal',
            'pengirim',
            'tujuan',
            'lampiran',
            'ringkasan',
            'poinPenting',
          ],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return {
        status: 502,
        body: {
          error:
            'Model AI tidak mengembalikan teks hasil pembacaan. Pastikan dokumen surat terlihat jelas dan tidak terenkripsi.',
        },
      };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return {
        status: 502,
        body: {
          error: 'Format respons AI tidak valid. Silakan coba unggah ulang dokumen.',
        },
      };
    }

    const normalized = normalizeLetterExtraction(parsed);
    return { status: 200, body: { data: normalized } };
  } catch (err: unknown) {
    console.error('Error extracting letter with Gemini:', err);
    const message =
      err instanceof Error ? err.message : 'Terjadi kesalahan saat menganalisis surat.';

    if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
      return {
        status: 401,
        body: {
          error:
            'API Key Gemini tidak valid atau tidak memiliki izin. Periksa pengaturan Environment Variables (GEMINI_API_KEY).',
        },
      };
    }

    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      return {
        status: 429,
        body: {
          error:
            'Batas kuota permintaan Gemini API tercapai sementara. Silakan tunggu beberapa saat lalu coba lagi.',
        },
      };
    }

    return {
      status: 500,
      body: {
        error:
          'Gagal menganalisis dokumen dengan AI. Pastikan format dokumen jelas atau lengkapi form secara manual.',
      },
    };
  }
}
