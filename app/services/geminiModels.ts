import { GenerationMode, OutputLayout } from '../types';

export const TEXT_FAST_MODEL = 'gemini-3.1-flash-lite';
export const VISION_ANALYSIS_MODEL = 'gemini-3.1-flash-lite';
export const IMAGE_FAST_MODEL = 'gemini-3.1-flash-lite-image';
export const IMAGE_DEFAULT_MODEL = 'gemini-3.1-flash-image';

export const GENERATION_MODE_LABELS: Record<GenerationMode, string> = {
  fast: 'Fast Preview',
  studio: 'Studio Quality',
};

export const OUTPUT_LAYOUT_LABELS: Record<OutputLayout, string> = {
  single: 'Single Reveal',
  'salon-sheet': 'Salon Sheet',
  'before-after': 'Before / After',
};

export const getImageModelForMode = (mode: GenerationMode = 'fast') => {
  if (mode === 'fast') return IMAGE_FAST_MODEL;
  return IMAGE_DEFAULT_MODEL;
};
