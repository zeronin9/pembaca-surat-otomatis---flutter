import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/surat_model.dart';

class StorageService {
  static const String _storageKey = 'arsip_surat_v1';

  Future<List<SuratModel>> muatSemuaSurat() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) {
      return [];
    }
    return SuratModel.decodeList(raw);
  }

  Future<void> simpanDaftarSurat(List<SuratModel> daftar) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, SuratModel.encodeList(daftar));
  }

  String _escapeCsv(String value) {
    final normalized = value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
    if (normalized.contains(',') ||
        normalized.contains('"') ||
        normalized.contains('\n')) {
      return '"${normalized.replaceAll('"', '""')}"';
    }
    return normalized;
  }

  String buatStringCsvDenganBom(List<SuratModel> daftar) {
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

    final buffer = StringBuffer('\uFEFF');
    buffer.writeln(headers.map(_escapeCsv).join(','));

    for (final surat in daftar) {
      final row = [
        surat.jenisSurat,
        surat.nomorSurat.isEmpty ? '-' : surat.nomorSurat,
        surat.tanggalSurat.isEmpty ? '-' : surat.tanggalSurat,
        surat.perihal,
        surat.pengirim,
        surat.tujuan.isEmpty ? '-' : surat.tujuan,
        surat.lampiran.isEmpty ? '-' : surat.lampiran,
        surat.ringkasan,
        surat.poinPenting.isEmpty ? '-' : surat.poinPenting,
        surat.namaFile,
        surat.createdAt.toIso8601String(),
      ];
      buffer.writeln(row.map(_escapeCsv).join(','));
    }

    return buffer.toString();
  }

  Future<void> exportDanBagikanCsv(List<SuratModel> daftar) async {
    final csvString = buatStringCsvDenganBom(daftar);
    final bytes = utf8.encode(csvString);
    final fileName =
        'arsip_surat_${DateTime.now().toIso8601String().substring(0, 10)}.csv';

    if (kIsWeb) {
      await Share.shareXFiles(
        [
          XFile.fromData(
            bytes,
            name: fileName,
            mimeType: 'text/csv',
          ),
        ],
        subject: 'Export Arsip Surat CSV',
      );
      return;
    }

    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/$fileName');
    await file.writeAsBytes(bytes, flush: true);

    await Share.shareXFiles(
      [XFile(file.path, mimeType: 'text/csv')],
      subject: 'Export Arsip Surat ($fileName)',
    );
  }
}
