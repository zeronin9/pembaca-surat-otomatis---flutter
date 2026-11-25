import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/surat_model.dart';

class GeminiService {
  static const String _modelName = 'gemini-2.5-flash';

  Future<SuratModel> ekstrakSurat({
    required Uint8List fileBytes,
    required String mimeType,
    required String namaFile,
  }) async {
    final apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';
    if (apiKey.isEmpty || apiKey == 'MASUKKAN_API_KEY_GEMINI_ANDA_DI_SINI') {
      throw Exception(
        'GEMINI_API_KEY belum diisi pada file .env. Silakan periksa konfigurasi Anda.',
      );
    }

    final responseSchema = Schema.object(
      properties: {
        'jenisSurat': Schema.enumString(
          enumValues: SuratModel.daftarJenisSurat,
          description: 'Kategori jenis surat resmi.',
        ),
        'nomorSurat': Schema.string(
          description: 'Nomor surat yang tertera pada dokumen.',
        ),
        'tanggalSurat': Schema.string(
          description:
              'Tanggal surat dalam format DD-MM-YYYY jika tertera pada surat.',
        ),
        'perihal': Schema.string(
          description: 'Perihal atau judul utama surat.',
        ),
        'pengirim': Schema.string(
          description: 'Nama pengirim atau instansi asal surat.',
        ),
        'tujuan': Schema.string(
          description: 'Penerima atau tujuan surat.',
        ),
        'lampiran': Schema.string(
          description: 'Keterangan lampiran, isi "-" jika tidak ada.',
        ),
        'ringkasan': Schema.string(
          description: 'Ringkasan isi surat dalam 2 sampai 3 kalimat padat.',
        ),
        'poinPenting': Schema.string(
          description:
              'Jadwal acara, tenggat waktu, lokasi, atau instruksi tindak lanjut khusus.',
        ),
      },
      requiredProperties: [
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
    );

    final model = GenerativeModel(
      model: _modelName,
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      ),
    );

    const prompt = '''
Anda adalah asisten arsiparis profesional Indonesia.
Baca dokumen surat terlampir secara menyeluruh dan ekstrak informasinya ke dalam JSON sesuai skema:
- Konversi tanggal surat menjadi format DD-MM-YYYY apabila tertera.
- Jika lampiran kosong atau tidak ada, isi dengan "-".
- Tulis ringkasan isi surat dalam 2–3 kalimat padat berbahasa Indonesia baku.
- Cantumkan poin penting atau tindak lanjut (jadwal, tempat, tenggat waktu) jika ada.
''';

    final response = await model.generateContent([
      Content.multi([
        DataPart(mimeType, fileBytes),
        TextPart(prompt),
      ]),
    ]);

    final text = response.text;
    if (text == null || text.trim().isEmpty) {
      throw Exception('Gemini tidak mengembalikan data ekstraksi.');
    }

    final jsonMap = jsonDecode(text) as Map<String, dynamic>;
    return SuratModel.fromJson(jsonMap, namaFile: namaFile);
  }
}
