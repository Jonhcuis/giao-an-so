export interface UploadedFile {
  file: File;
  base64: string;
  mimeType: string;
  textContent?: string;
  imageMap?: Record<string, string>;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface GenerationConfig {
  hasCompetenceTable: boolean;
  hasRegulations: boolean;
  hasLessonPlan: boolean;
}