import 'package:flutter/material.dart';
import '../models/surat_model.dart';

class ArchiveListWidget extends StatefulWidget {
  final List<SuratModel> arsipSurat;
  final Future<void> Function(String id) onDelete;
  final Future<void> Function() onExportCsv;

  const ArchiveListWidget({
    super.key,
    required this.arsipSurat,
    required this.onDelete,
    required this.onExportCsv,
  });

  @override
  State<ArchiveListWidget> createState() => _ArchiveListWidgetState();
}

class _ArchiveListWidgetState extends State<ArchiveListWidget> {
  String _searchQuery = '';
  String _selectedJenis = 'Semua';

  List<SuratModel> get _filteredSurat {
    final q = _searchQuery.trim().toLowerCase();
    return widget.arsipSurat.where((s) {
      final matchesJenis =
          _selectedJenis == 'Semua' || s.jenisSurat == _selectedJenis;
      if (!matchesJenis) return false;
      if (q.isEmpty) return true;
      return s.nomorSurat.toLowerCase().contains(q) ||
          s.perihal.toLowerCase().contains(q) ||
          s.pengirim.toLowerCase().contains(q);
    }).toList();
  }

  void _bukaDetailDialog(SuratModel surat) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(surat.perihal),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _detailRow('Jenis Surat', surat.jenisSurat),
              _detailRow('Nomor Surat', surat.nomorSurat),
              _detailRow('Tanggal Surat', surat.tanggalSurat),
              _detailRow('Pengirim', surat.pengirim),
              _detailRow('Tujuan', surat.tujuan),
              _detailRow('Lampiran', surat.lampiran),
              _detailRow('Ringkasan', surat.ringkasan),
              _detailRow('Poin Penting', surat.poinPenting),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  Future<void> _konfirmasiHapus(SuratModel surat) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Surat dari Arsip?'),
        content: Text(
          'Surat "${surat.perihal}" akan dihapus secara permanen dari arsip lokal.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await widget.onDelete(surat.id);
    }
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 2),
          Text(value.isEmpty ? '-' : value),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredSurat;
    final filterOptions = ['Semua', ...SuratModel.daftarJenisSurat];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(
                width: 360,
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Cari Nomor Surat, Perihal, atau Pengirim...',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (val) => setState(() => _searchQuery = val),
                ),
              ),
              FilledButton.tonalIcon(
                onPressed: widget.onExportCsv,
                icon: const Icon(Icons.download_rounded),
                label: const Text('Export ke CSV'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: filterOptions.map((jenis) {
                final selected = _selectedJenis == jenis;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(jenis),
                    selected: selected,
                    onSelected: (_) => setState(() => _selectedJenis = jenis),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Text(
                      'Belum ada surat yang sesuai dengan kriteria pencarian.',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                  )
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final surat = filtered[index];
                      return Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${surat.jenisSurat} • ${surat.nomorSurat.isEmpty ? 'Tanpa Nomor' : surat.nomorSurat} • ${surat.tanggalSurat.isEmpty ? '-' : surat.tanggalSurat}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                surat.perihal,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Pengirim: ${surat.pengirim}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF334155),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  TextButton.icon(
                                    onPressed: () => _bukaDetailDialog(surat),
                                    icon: const Icon(
                                      Icons.visibility_outlined,
                                      size: 18,
                                    ),
                                    label: const Text('Detail'),
                                  ),
                                  const SizedBox(width: 8),
                                  TextButton.icon(
                                    onPressed: () => _konfirmasiHapus(surat),
                                    icon: Icon(
                                      Icons.delete_outline,
                                      size: 18,
                                      color: Theme.of(context).colorScheme.error,
                                    ),
                                    label: Text(
                                      'Hapus',
                                      style: TextStyle(
                                        color:
                                            Theme.of(context).colorScheme.error,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
