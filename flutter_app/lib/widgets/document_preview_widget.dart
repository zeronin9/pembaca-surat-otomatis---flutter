import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

class DocumentPreviewWidget extends StatelessWidget {
  final Uint8List bytes;
  final String mimeType;
  final String fileName;

  const DocumentPreviewWidget({
    super.key,
    required this.bytes,
    required this.mimeType,
    required this.fileName,
  });

  @override
  Widget build(BuildContext context) {
    final isPdf = mimeType == 'application/pdf';

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  isPdf ? Icons.picture_as_pdf_outlined : Icons.image_outlined,
                  size: 20,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    fileName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                if (!isPdf)
                  const Text(
                    'Pinch / Scroll untuk Zoom',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(16),
              ),
              child: isPdf
                  ? SfPdfViewer.memory(bytes)
                  : InteractiveViewer(
                      minScale: 0.8,
                      maxScale: 5.0,
                      child: Center(
                        child: Image.memory(bytes, fit: BoxFit.contain),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
