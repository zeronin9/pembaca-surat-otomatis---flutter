import pubspecYaml from '../../flutter_app/pubspec.yaml?raw';
import envExample from '../../flutter_app/.env.example?raw';
import readmeMd from '../../flutter_app/README.md?raw';
import mainDart from '../../flutter_app/lib/main.dart?raw';
import suratModelDart from '../../flutter_app/lib/models/surat_model.dart?raw';
import geminiServiceDart from '../../flutter_app/lib/services/gemini_service.dart?raw';
import storageServiceDart from '../../flutter_app/lib/services/storage_service.dart?raw';
import homeScreenDart from '../../flutter_app/lib/screens/home_screen.dart?raw';
import uploadAreaDart from '../../flutter_app/lib/widgets/upload_area_widget.dart?raw';
import documentPreviewDart from '../../flutter_app/lib/widgets/document_preview_widget.dart?raw';
import extractionFormDart from '../../flutter_app/lib/widgets/extraction_form_widget.dart?raw';
import archiveListDart from '../../flutter_app/lib/widgets/archive_list_widget.dart?raw';

export interface FlutterCodeFile {
  path: string;
  label: string;
  group: string;
  language: 'dart' | 'yaml' | 'markdown' | 'env';
  content: string;
}

export const FLUTTER_CODE_FILES: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    label: 'pubspec.yaml',
    group: 'Konfigurasi Proyek',
    language: 'yaml',
    content: pubspecYaml,
  },
  {
    path: '.env.example',
    label: '.env.example',
    group: 'Konfigurasi Proyek',
    language: 'env',
    content: envExample,
  },
  {
    path: 'README.md',
    label: 'README.md',
    group: 'Konfigurasi Proyek',
    language: 'markdown',
    content: readmeMd,
  },
  {
    path: 'lib/main.dart',
    label: 'lib/main.dart',
    group: 'Aplikasi Utama',
    language: 'dart',
    content: mainDart,
  },
  {
    path: 'lib/models/surat_model.dart',
    label: 'models/surat_model.dart',
    group: 'Models & Services',
    language: 'dart',
    content: suratModelDart,
  },
  {
    path: 'lib/services/gemini_service.dart',
    label: 'services/gemini_service.dart',
    group: 'Models & Services',
    language: 'dart',
    content: geminiServiceDart,
  },
  {
    path: 'lib/services/storage_service.dart',
    label: 'services/storage_service.dart',
    group: 'Models & Services',
    language: 'dart',
    content: storageServiceDart,
  },
  {
    path: 'lib/screens/home_screen.dart',
    label: 'screens/home_screen.dart',
    group: 'Screens & Widgets',
    language: 'dart',
    content: homeScreenDart,
  },
  {
    path: 'lib/widgets/upload_area_widget.dart',
    label: 'widgets/upload_area_widget.dart',
    group: 'Screens & Widgets',
    language: 'dart',
    content: uploadAreaDart,
  },
  {
    path: 'lib/widgets/document_preview_widget.dart',
    label: 'widgets/document_preview_widget.dart',
    group: 'Screens & Widgets',
    language: 'dart',
    content: documentPreviewDart,
  },
  {
    path: 'lib/widgets/extraction_form_widget.dart',
    label: 'widgets/extraction_form_widget.dart',
    group: 'Screens & Widgets',
    language: 'dart',
    content: extractionFormDart,
  },
  {
    path: 'lib/widgets/archive_list_widget.dart',
    label: 'widgets/archive_list_widget.dart',
    group: 'Screens & Widgets',
    language: 'dart',
    content: archiveListDart,
  },
];
