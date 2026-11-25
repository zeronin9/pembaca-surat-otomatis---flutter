import 'dart:typed_data';
import 'package:desktop_drop/desktop_drop.dart';
import 'package:flutter/material.dart';

class UploadAreaWidget extends StatefulWidget {
  final VoidCallback onPickFile;
  final Future<void> Function(Uint8List bytes, String fileName) onDropFile;

  const UploadAreaWidget({
    super.key,
    required this.onPickFile,
    required this.onDropFile,
  });

  @override
  State<UploadAreaWidget> createState() => _UploadAreaWidgetState();
}

class _UploadAreaWidgetState extends State<UploadAreaWidget> {
  bool _isDragging = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 680),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: DropTarget(
            onDragEntered: (_) => setState(() => _isDragging = true),
            onDragExited: (_) => setState(() => _isDragging = false),
            onDragDone: (details) async {
              setState(() => _isDragging = false);
              if (details.files.isEmpty) return;
              final xFile = details.files.first;
              final bytes = await xFile.readAsBytes();
              await widget.onDropFile(bytes, xFile.name);
            },
            child: InkWell(
              onTap: widget.onPickFile,
              borderRadius: BorderRadius.circular(20),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
                decoration: BoxDecoration(
                  color: _isDragging
                      ? colorScheme.primaryContainer.withValues(alpha: 0.35)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _isDragging
                        ? colorScheme.primary
                        : const Color(0xFFCBD5E1),
                    width: _isDragging ? 2 : 1.5,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: colorScheme.primaryContainer
                            .withValues(alpha: 0.5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.upload_file_rounded,
                        size: 40,
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Unggah atau Seret Dokumen Surat',
                      textAlign: TextAlign.center,
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Mendukung format PDF (.pdf) dan gambar (.jpg, .jpeg, .png, .webp). Ekstraksi AI berjalan otomatis begitu dokumen dipilih.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF475569), height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      onPressed: widget.onPickFile,
                      icon: const Icon(Icons.folder_open_outlined),
                      label: const Text('Pilih File Dokumen'),
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
