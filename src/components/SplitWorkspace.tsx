import type { ExtractedLetterData, UploadedDocument } from '../types/letter';
import { ExtractionForm } from './ExtractionForm';

interface SplitWorkspaceProps {
  document?: UploadedDocument;
  formData: ExtractedLetterData;
  isAnalyzing: boolean;
  onChange: (updated: ExtractedLetterData) => void;
  onSaveToArchive: (data: ExtractedLetterData) => void;
  onReset: () => void;
}

export function SplitWorkspace({
  formData,
  isAnalyzing,
  onChange,
  onSaveToArchive,
  onReset,
}: SplitWorkspaceProps) {
  return (
    <section aria-label="Area kerja pembacaan dan ekstraksi surat" className="pt-2">
      <ExtractionForm
        formData={formData}
        isAnalyzing={isAnalyzing}
        onChange={onChange}
        onSaveToArchive={onSaveToArchive}
        onReset={onReset}
      />
    </section>
  );
}
