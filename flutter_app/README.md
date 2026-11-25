# Pembaca Surat Otomatis (Flutter Material 3 + Gemini 2.5 Flash)

Aplikasi Flutter lintas platform (Android, iOS, Web, Windows, macOS) untuk memindai dokumen surat resmi (PDF & gambar) dan mengekstrak metadata terstruktur secara otomatis menggunakan **Gemini 2.5 Flash** (`google_generative_ai` + `responseSchema`).

## Struktur Direktori

```text
lib/
├── main.dart
├── models/
│   └── surat_model.dart
├── services/
│   ├── gemini_service.dart
│   └── storage_service.dart
├── screens/
│   └── home_screen.dart
└── widgets/
    ├── upload_area_widget.dart
    ├── document_preview_widget.dart
    ├── extraction_form_widget.dart
    └── archive_list_widget.dart
```

## Cara Menjalankan Aplikasi

1. Pastikan Flutter SDK (`>= 3.4.0`) telah terpasang di perangkat Anda.
2. Buat file `.env` di root proyek Flutter (sejajar dengan `pubspec.yaml`) berdasarkan `.env.example`:
   ```env
   GEMINI_API_KEY=AIzaSy...API_KEY_ANDA
   ```
3. Unduh seluruh package yang diperlukan:
   ```bash
   flutter pub get
   ```
4. Jalankan aplikasi di perangkat/emulator/desktop/web pilihan Anda:
   ```bash
   flutter run
   ```
