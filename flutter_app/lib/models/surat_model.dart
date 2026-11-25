import 'dart:convert';

class SuratModel {
  final String id;
  final String jenisSurat;
  final String nomorSurat;
  final String tanggalSurat;
  final String perihal;
  final String pengirim;
  final String tujuan;
  final String lampiran;
  final String ringkasan;
  final String poinPenting;
  final String namaFile;
  final DateTime createdAt;

  static const List<String> daftarJenisSurat = [
    'Surat Undangan',
    'Surat Permohonan',
    'Surat Edaran',
    'Surat Tugas',
    'Surat Pemberitahuan',
    'Lainnya',
  ];

  const SuratModel({
    required this.id,
    required this.jenisSurat,
    required this.nomorSurat,
    required this.tanggalSurat,
    required this.perihal,
    required this.pengirim,
    required this.tujuan,
    required this.lampiran,
    required this.ringkasan,
    required this.poinPenting,
    required this.namaFile,
    required this.createdAt,
  });

  factory SuratModel.fromJson(
    Map<String, dynamic> json, {
    String? id,
    String? namaFile,
    DateTime? createdAt,
  }) {
    final rawJenis = (json['jenisSurat'] ?? 'Lainnya').toString().trim();
    final matchedJenis = daftarJenisSurat.firstWhere(
      (j) => j.toLowerCase() == rawJenis.toLowerCase(),
      orElse: () => 'Lainnya',
    );

    final rawLampiran = (json['lampiran'] ?? '-').toString().trim();
    final lampiran = rawLampiran.isEmpty ||
            rawLampiran.toLowerCase() == 'tidak ada' ||
            rawLampiran.toLowerCase() == 'nihil'
        ? '-'
        : rawLampiran;

    return SuratModel(
      id: id ??
          (json['id']?.toString() ??
              DateTime.now().microsecondsSinceEpoch.toString()),
      jenisSurat: matchedJenis,
      nomorSurat: (json['nomorSurat'] ?? '').toString().trim(),
      tanggalSurat: (json['tanggalSurat'] ?? '').toString().trim(),
      perihal: (json['perihal'] ?? '').toString().trim(),
      pengirim: (json['pengirim'] ?? '').toString().trim(),
      tujuan: (json['tujuan'] ?? '').toString().trim(),
      lampiran: lampiran,
      ringkasan: (json['ringkasan'] ?? '').toString().trim(),
      poinPenting: (json['poinPenting'] ?? '').toString().trim(),
      namaFile: namaFile ?? (json['namaFile'] ?? 'dokumen_surat').toString(),
      createdAt: createdAt ??
          (json['createdAt'] != null
              ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'jenisSurat': jenisSurat,
        'nomorSurat': nomorSurat,
        'tanggalSurat': tanggalSurat,
        'perihal': perihal,
        'pengirim': pengirim,
        'tujuan': tujuan,
        'lampiran': lampiran,
        'ringkasan': ringkasan,
        'poinPenting': poinPenting,
        'namaFile': namaFile,
        'createdAt': createdAt.toIso8601String(),
      };

  String toClipboardSummary() {
    return [
      '*INFO SURAT ($jenisSurat)*',
      'Nomor: ${nomorSurat.isEmpty ? '-' : nomorSurat}',
      'Tanggal: ${tanggalSurat.isEmpty ? '-' : tanggalSurat}',
      'Perihal: ${perihal.isEmpty ? '-' : perihal}',
      'Pengirim: ${pengirim.isEmpty ? '-' : pengirim}',
      'Ringkasan: ${ringkasan.isEmpty ? '-' : ringkasan}',
    ].join('\n');
  }

  static String encodeList(List<SuratModel> items) =>
      jsonEncode(items.map((e) => e.toJson()).toList());

  static List<SuratModel> decodeList(String raw) {
    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((item) => SuratModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
