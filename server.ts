import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  JENIS_SURAT_OPTIONS,
  normalizeExtractedSurat,
} from './src/utils/surat.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/extract-surat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'GEMINI_API_KEY belum dikonfigurasi pada server. Silakan atur GEMINI_API_KEY di panel Secrets agar analisis AI dapat berjalan.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const { fileBase64, mimeType, fileName } = req.body as {
        fileBase64?: string;
        mimeType?: string;
        fileName?: string;
      };

      if (!fileBase64 || typeof fileBase64 !== 'string') {
        res.status(400).json({
          error: 'Data file dokumen tidak ditemukan dalam permintaan.',
          code: 'INVALID_PAYLOAD',
        });
        return;
      }

      if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
        res.status(400).json({
          error:
            'Format file tidak didukung. Gunakan file PDF (.pdf) atau gambar (.jpg, .jpeg, .png, .webp).',
          code: 'UNSUPPORTED_MIME_TYPE',
        });
        return;
      }

      // Strip potential data URL prefix if sent by client
      const cleanBase64 = fileBase64.includes(',')
        ? fileBase64.split(',')[1]
        : fileBase64;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = [
        'Anda adalah asisten arsiparis profesional Indonesia yang membaca dokumen surat resmi (PDF atau gambar pindaian).',
        'Ekstrak seluruh metadata penting dari dokumen surat ini secara akurat dalam bahasa Indonesia.',
        'Aturan khusus:',
        '- jenisSurat: pilih paling tepat dari daftar enum.',
        '- tanggalSurat: ubah menjadi format DD-MM-YYYY jika tanggal tertera di surat (misal "24 November 2026" menjadi "24-11-2026"). Kosongkan string jika tidak tertera.',
        '- lampiran: isi "-" jika tidak ada lampiran atau tertulis tidak ada.',
        '- ringkasan: tulis 2 sampai 3 kalimat padat dan jelas yang merangkum inti surat.',
        '- poinPenting: tulis jadwal acara, tempat, tenggat waktu, atau instruksi tindak lanjut penting jika ada.',
        fileName ? `Nama file dokumen: ${fileName}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const schemaConfig = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jenisSurat: {
              type: Type.STRING,
              enum: [...JENIS_SURAT_OPTIONS],
              description:
                'Kategori jenis surat: Surat Undangan, Surat Permohonan, Surat Edaran, Surat Tugas, Surat Pemberitahuan, atau Lainnya.',
            },
            nomorSurat: {
              type: Type.STRING,
              description: 'Nomor surat resmi yang tertera pada kepala surat.',
            },
            tanggalSurat: {
              type: Type.STRING,
              description:
                'Tanggal pembuatan surat dalam format DD-MM-YYYY jika tertera.',
            },
            perihal: {
              type: Type.STRING,
              description: 'Perihal atau judul utama surat.',
            },
            pengirim: {
              type: Type.STRING,
              description: 'Nama instansi, organisasi, atau pejabat pengirim surat.',
            },
            tujuan: {
              type: Type.STRING,
              description: 'Nama instansi, jabatan, atau pihak penerima tujuan surat.',
            },
            lampiran: {
              type: Type.STRING,
              description: 'Keterangan jumlah atau jenis lampiran, isi "-" jika tidak ada.',
            },
            ringkasan: {
              type: Type.STRING,
              description: 'Ringkasan isi surat dalam 2 sampai 3 kalimat padat.',
            },
            poinPenting: {
              type: Type.STRING,
              description:
                'Poin penting atau tindak lanjut seperti jadwal, lokasi, tenggat waktu, atau instruksi khusus.',
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
      };

      const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null =
        null;
      let lastError: unknown = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
              config: schemaConfig,
            });
            lastError = null;
            break;
          } catch (attemptErr: unknown) {
            lastError = attemptErr;
            const errStr =
              attemptErr instanceof Error ? attemptErr.message : String(attemptErr);
            const isTransient =
              errStr.includes('503') ||
              errStr.includes('UNAVAILABLE') ||
              errStr.includes('high demand') ||
              errStr.includes('404') ||
              errStr.includes('NOT_FOUND');
            if (!isTransient) {
              throw attemptErr;
            }
            if (attempt === 0 && !errStr.includes('404')) {
              await new Promise((r) => setTimeout(r, 900));
            } else {
              break;
            }
          }
        }
        if (response) break;
      }

      if (!response) {
        throw lastError ?? new Error('Gagal menghubungi layanan Gemini.');
      }

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          error: 'Model AI tidak mengembalikan hasil ekstraksi. Silakan coba lagi.',
          code: 'EMPTY_RESPONSE',
        });
        return;
      }

      const parsed = JSON.parse(rawText);
      const normalized = normalizeExtractedSurat(parsed);

      res.json({ data: normalized });
    } catch (err: unknown) {
      console.error('Error /api/extract-surat:', err);
      const rawMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menganalisis dokumen surat.';

      let friendlyMessage = rawMessage;
      try {
        const parsedErr = JSON.parse(rawMessage) as {
          error?: { message?: string };
        };
        if (parsedErr?.error?.message) {
          friendlyMessage = parsedErr.error.message;
        }
      } catch {
        // Keep rawMessage when not JSON
      }

      if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('403')) {
        res.status(403).json({
          error:
            'API Key Gemini tidak valid atau belum memiliki izin. Periksa pengaturan Secrets Anda.',
          code: 'API_KEY_ERROR',
        });
        return;
      }

      if (rawMessage.includes('429') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            'Batas kuota permintaan Gemini API tercapai sementara. Silakan tunggu sebentar lalu coba lagi.',
          code: 'QUOTA_EXCEEDED',
        });
        return;
      }

      res.status(500).json({
        error: `Gagal menganalisis surat: ${friendlyMessage}`,
        code: 'EXTRACTION_FAILED',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
