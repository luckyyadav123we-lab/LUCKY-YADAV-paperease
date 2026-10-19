export type ToolCategory =
  | 'organize-pdf'
  | 'convert-to-pdf'
  | 'convert-from-pdf'
  | 'image-convert'
  | 'image-edit'
  | 'ocr-security'
  | 'ai-assistant';

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  popular?: boolean;
  acceptedFormats: string[]; // e.g. ['.pdf', 'application/pdf']
  outputFormat: string; // e.g. 'pdf', 'docx', 'jpg'
  status: 'active' | 'coming-soon';
  maxFiles: number;
  seoTitle: string;
  seoDescription: string;
  features: string[];
  faqs: { question: string; answer: string }[];
}

export type UserTier = 'free' | 'pro' | 'business';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  operationsToday: number;
  maxDailyOperations: number;
  maxFileSizeMB: number;
  joinedDate: string;
}

export interface ConversionJob {
  id: string;
  toolId: string;
  toolName: string;
  inputFileName: string;
  inputFileSize: number;
  outputFileName: string;
  outputFileSize: number;
  outputUrl?: string;
  outputBlob?: Blob;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  statusMessage?: string;
  createdAt: number;
  completedAt?: number;
  settings?: Record<string, any>;
  error?: string;
}

export interface PDFOrganizeOptions {
  pageRange?: string; // e.g. "1-3, 5"
  deletePages?: number[];
  rotationDegrees?: 0 | 90 | 180 | 270;
  watermarkText?: string;
  watermarkOpacity?: number;
  addPageNumbers?: boolean;
  pageNumberPosition?: 'bottom-center' | 'bottom-right';
  compressionLevel?: 'low' | 'balanced' | 'high';
}

export interface ImageProcessOptions {
  targetFormat: 'png' | 'jpeg' | 'webp' | 'bmp';
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  widthPercent?: number;
  rotate?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  grayscale?: boolean;
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  backgroundColorForTransparency?: string; // e.g. '#ffffff'
  watermarkText?: string;
}

export interface OCROptions {
  language: 'eng' | 'spa' | 'fra' | 'deu';
  outputType: 'txt' | 'searchable-pdf';
}
