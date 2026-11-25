import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/surat_model.dart';

class ExtractionFormWidget extends StatefulWidget {
  final SuratModel initialData;
  final Future<void> Function(SuratModel surat) onSave;
  final VoidCallback onReset;
  final VoidCallback onCopied;

  const ExtractionFormWidget({
    super.key,
    required this.initialData,
    required this.onSave,
    required this.onReset,
    required this.onCopied,
  });

  @override
  State<ExtractionFormWidget> createState() => _ExtractionFormWidgetState();
}

class _ExtractionFormWidgetState extends State<ExtractionFormWidget> {
  final _formKey = GlobalKey<FormState>();

  late String _jenisSurat;
  late TextEditingController _nomorCtrl;
  late TextEditingController _tanggalCtrl;
  late TextEditingController _perihalCtrl;
  late TextEditingController _pengirimCtrl;
  late TextEditingController _tujuanCtrl;
  late TextEditingController _lampiranCtrl;
  late TextEditingController _ringkasanCtrl;
  late TextEditingController _poinPentingCtrl;

  @override
  void initState() {
    super.initState();
    _initControllers(widget.initialData);
  }

  @override
  void didUpdateWidget(covariant ExtractionFormWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialData.id != widget.initialData.id) {
      _disposeControllers();
      _initControllers(widget.initialData);
    }
  }

  void _initControllers(SuratModel data) {
    _jenisSurat = data.jenisSurat;
    _nomorCtrl = TextEditingController(text: data.nomorSurat);
    _tanggalCtrl = TextEditingController(text: data.tanggalSurat);
    _perihalCtrl = TextEditingController(text: data.perihal);
    _pengirimCtrl = TextEditingController(text: data.pengirim);
    _tujuanCtrl = TextEditingController(text: data.tujuan);
    _lampiranCtrl = TextEditingController(text: data.lampiran);
    _ringkasanCtrl = TextEditingController(text: data.ringkasan);
    _poinPentingCtrl = TextEditingController(text: data.poinPenting);
  }

  void _disposeControllers() {
    _nomorCtrl.dispose();
    _tanggalCtrl.dispose();
    _perihalCtrl.dispose();
    _pengirimCtrl.dispose();
    _tujuanCtrl.dispose();
    _lampiranCtrl.dispose();
    _ringkasanCtrl.dispose();
    _poinPentingCtrl.dispose();
  }

  @override
  void dispose() {
    _disposeControllers();
    super.dispose();
  }

  SuratModel _buildCurrentModel() {
    return SuratModel(
      id: widget.initialData.id,
      jenisSurat: _jenisSurat,
      nomorSurat: _nomorCtrl.text.trim(),
      tanggalSurat: _tanggalCtrl.text.trim(),
      perihal: _perihalCtrl.text.trim(),
      pengirim: _pengirimCtrl.text.trim(),
      tujuan: _tujuanCtrl.text.trim(),
      lampiran: _lampiranCtrl.text.trim().isEmpty
          ? '-'
          : _lampiranCtrl.text.trim(),
      ringkasan: _ringkasanCtrl.text.trim(),
      poinPenting: _poinPentingCtrl.text.trim(),
      namaFile: widget.initialData.namaFile,
      createdAt: DateTime.now(),
    );
  }

  Future<void> _salinInfoSurat() async {
    final model = _buildCurrentModel();
    await Clipboard.setData(ClipboardData(text: model.toClipboardSummary()));
    widget.onCopied();
  }

  Future<void> _simpan() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    await widget.onSave(_buildCurrentModel());
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Hasil Ekstraksi Surat',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              const Text(
                'Periksa dan sunting data di bawah ini sebelum disimpan ke arsip.',
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: _jenisSurat,
                decoration: const InputDecoration(labelText: 'Jenis Surat'),
                items: SuratModel.daftarJenisSurat
                    .map((j) => DropdownMenuItem(value: j, child: Text(j)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _jenisSurat = val);
                },
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _nomorCtrl,
                      decoration:
                          const InputDecoration(labelText: 'Nomor Surat'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _tanggalCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Surat (DD-MM-YYYY)',
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _perihalCtrl,
                decoration: const InputDecoration(
                  labelText: 'Perihal / Judul Surat',
                ),
                validator: (val) => (val == null || val.trim().isEmpty)
                    ? 'Perihal wajib diisi'
                    : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _pengirimCtrl,
                decoration: const InputDecoration(
                  labelText: 'Pengirim / Instansi Asal',
                ),
                validator: (val) => (val == null || val.trim().isEmpty)
                    ? 'Pengirim wajib diisi'
                    : null,
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _tujuanCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Tujuan / Penerima',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _lampiranCtrl,
                      decoration: const InputDecoration(labelText: 'Lampiran'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _ringkasanCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Ringkasan Isi Surat',
                  alignLabelWithHint: true,
                ),
                validator: (val) => (val == null || val.trim().isEmpty)
                    ? 'Ringkasan wajib diisi'
                    : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _poinPentingCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Poin Penting / Tindak Lanjut',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.end,
                children: [
                  TextButton(
                    onPressed: widget.onReset,
                    child: const Text('Batal / Reset'),
                  ),
                  OutlinedButton.icon(
                    onPressed: _salinInfoSurat,
                    icon: const Icon(Icons.copy_rounded, size: 18),
                    label: const Text('Salin Info Surat'),
                  ),
                  FilledButton.icon(
                    onPressed: _simpan,
                    icon: const Icon(Icons.save_outlined, size: 18),
                    label: const Text('Simpan ke Arsip'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
