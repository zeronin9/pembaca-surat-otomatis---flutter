import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../models/surat_model.dart';
import '../services/gemini_service.dart';
import '../services/storage_service.dart';
import '../widgets/archive_list_widget.dart';
import '../widgets/document_preview_widget.dart';
import '../widgets/extraction_form_widget.dart';
import '../widgets/upload_area_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GeminiService _geminiService = GeminiService();
  final StorageService _storageService = StorageService();

  int _selectedTabIndex = 0;
  List<SuratModel> _arsipSurat = [];

  Uint8List? _selectedBytes;
  String? _selectedFileName;
  String? _selectedMimeType;
  bool _isAnalyzing = false;
  SuratModel? _hasilEkstraksi;

  @override
  void initState() {
    super.initState();
    _muatArsipAwal();
  }

  Future<void> _muatArsipAwal() async {
    final data = await _storageService.muatSemuaSurat();
    if (mounted) {
      setState(() => _arsipSurat = data);
    }
  }

  String _deteksiMimeType(String fileName) {
    final ext = fileName.split('.').last.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return '';
    }
  }

  Future<void> _pilihFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
      withData: true,
    );

    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    final bytes = file.bytes;
    if (bytes == null) {
      _tampilkanPesan('Gagal membaca isi file yang dipilih.', isError: true);
      return;
    }
    await _prosesDokumen(bytes, file.name);
  }

  Future<void> _prosesDokumen(Uint8List bytes, String fileName) async {
    final mimeType = _deteksiMimeType(fileName);
    if (mimeType.isEmpty) {
      _tampilkanPesan(
        'Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.',
        isError: true,
      );
      return;
    }

    setState(() {
      _selectedTabIndex = 0;
      _selectedBytes = bytes;
      _selectedFileName = fileName;
      _selectedMimeType = mimeType;
      _isAnalyzing = true;
      _hasilEkstraksi = null;
    });

    try {
      final hasil = await _geminiService.ekstrakSurat(
        fileBytes: bytes,
        mimeType: mimeType,
        namaFile: fileName,
      );
      if (mounted) {
        setState(() {
          _hasilEkstraksi = hasil;
          _isAnalyzing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _hasilEkstraksi = SuratModel(
            id: DateTime.now().microsecondsSinceEpoch.toString(),
            jenisSurat: 'Lainnya',
            nomorSurat: '',
            tanggalSurat: '',
            perihal: '',
            pengirim: '',
            tujuan: '',
            lampiran: '-',
            ringkasan: '',
            poinPenting: '',
            namaFile: fileName,
            createdAt: DateTime.now(),
          );
        });
        _tampilkanPesan(
          'Gagal menganalisis surat: ${e.toString().replaceFirst('Exception: ', '')}',
          isError: true,
        );
      }
    }
  }

  Future<void> _simpanKeArsip(SuratModel suratBaru) async {
    final updated = [suratBaru, ..._arsipSurat];
    await _storageService.simpanDaftarSurat(updated);
    if (mounted) {
      setState(() {
        _arsipSurat = updated;
        _resetPemindai();
      });
      _tampilkanPesan('Surat berhasil disimpan ke arsip.');
    }
  }

  Future<void> _hapusDariArsip(String id) async {
    final updated = _arsipSurat.where((s) => s.id != id).toList();
    await _storageService.simpanDaftarSurat(updated);
    if (mounted) {
      setState(() => _arsipSurat = updated);
      _tampilkanPesan('Surat dihapus dari arsip.');
    }
  }

  void _resetPemindai() {
    setState(() {
      _selectedBytes = null;
      _selectedFileName = null;
      _selectedMimeType = null;
      _isAnalyzing = false;
      _hasilEkstraksi = null;
    });
  }

  void _tampilkanPesan(String pesan, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(pesan),
        backgroundColor: isError ? Theme.of(context).colorScheme.error : null,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.document_scanner_outlined,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 10),
            const Text(
              'Pembaca Surat Otomatis',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
            const SizedBox(width: 12),
            Badge(
              label: Text('${_arsipSurat.length} Arsip'),
              backgroundColor:
                  Theme.of(context).colorScheme.primaryContainer,
              textColor:
                  Theme.of(context).colorScheme.onPrimaryContainer,
            ),
          ],
        ),
        actions: isWide
            ? [
                TextButton.icon(
                  onPressed: () => setState(() => _selectedTabIndex = 0),
                  icon: const Icon(Icons.upload_file_outlined),
                  label: const Text('Pemindai'),
                ),
                const SizedBox(width: 4),
                TextButton.icon(
                  onPressed: () => setState(() => _selectedTabIndex = 1),
                  icon: const Icon(Icons.inventory_2_outlined),
                  label: Text('Riwayat Arsip (${_arsipSurat.length})'),
                ),
                const SizedBox(width: 16),
              ]
            : null,
      ),
      body: SafeArea(
        child: _selectedTabIndex == 0
            ? _buildPemindaiView(isWide)
            : ArchiveListWidget(
                arsipSurat: _arsipSurat,
                onDelete: _hapusDariArsip,
                onExportCsv: () async {
                  if (_arsipSurat.isEmpty) {
                    _tampilkanPesan('Belum ada arsip untuk diekspor.');
                    return;
                  }
                  await _storageService.exportDanBagikanCsv(_arsipSurat);
                },
              ),
      ),
      bottomNavigationBar: isWide
          ? null
          : NavigationBar(
              selectedIndex: _selectedTabIndex,
              onDestinationSelected: (idx) =>
                  setState(() => _selectedTabIndex = idx),
              destinations: [
                const NavigationDestination(
                  icon: Icon(Icons.document_scanner_outlined),
                  selectedIcon: Icon(Icons.document_scanner),
                  label: 'Pemindai',
                ),
                NavigationDestination(
                  icon: Badge(
                    label: Text('${_arsipSurat.length}'),
                    child: const Icon(Icons.inventory_2_outlined),
                  ),
                  selectedIcon: const Icon(Icons.inventory_2),
                  label: 'Riwayat Arsip',
                ),
              ],
            ),
    );
  }

  Widget _buildPemindaiView(bool isWide) {
    if (_selectedBytes == null) {
      return UploadAreaWidget(
        onPickFile: _pilihFile,
        onDropFile: _prosesDokumen,
      );
    }

    if (_isAnalyzing) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text(
              'Sedang menganalisis isi surat...',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 6),
            Text(
              'Gemini 2.5 Flash sedang membaca metadata dan ringkasan dokumen',
              style: TextStyle(color: Color(0xFF64748B)),
            ),
          ],
        ),
      );
    }

    final previewPanel = DocumentPreviewWidget(
      bytes: _selectedBytes!,
      mimeType: _selectedMimeType ?? '',
      fileName: _selectedFileName ?? 'dokumen',
    );

    final formPanel = ExtractionFormWidget(
      initialData: _hasilEkstraksi!,
      onSave: _simpanKeArsip,
      onReset: _resetPemindai,
      onCopied: () =>
          _tampilkanPesan('Info surat berhasil disalin ke clipboard.'),
    );

    if (isWide) {
      return Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(flex: 5, child: previewPanel),
            const SizedBox(width: 20),
            Expanded(flex: 6, child: SingleChildScrollView(child: formPanel)),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          SizedBox(height: 380, child: previewPanel),
          const SizedBox(height: 16),
          formPanel,
        ],
      ),
    );
  }
}
