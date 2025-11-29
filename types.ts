
export interface HairstyleOption {
  id: string;
  label: string;
  description: string;
  category: 'length' | 'texture' | 'color' | 'style';
  imageUrl?: string; // Added for visual menu
}

export interface GeneratedImage {
  id: string; // Unique ID for tracking
  url: string;
  prompt: string;
  title?: string; // Short AI-generated title
  timestamp: number;
}

export type ViewType = 'front' | 'side' | 'back';

export interface UploadedImages {
  front: string | null; // base64
  side: string | null; // base64
  back: string | null; // base64
}

export interface AppState {
  step: 'upload' | 'style' | 'generating' | 'result';
  images: UploadedImages;
  selectedStyle: string;
  customPrompt: string;
  styleReferenceImage: string | null; // New: User uploaded style reference
  styleReferenceUrl: string | null;   // New: YouTube/TikTok URL
  generatedResult: GeneratedImage | null;
  history: GeneratedImage[]; // Track versions for undo/redo
  theme: 'light' | 'dark';
  isMarketingModalOpen: boolean; // Hook for CTAs
}

// Augment the global Window interface for AIStudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
