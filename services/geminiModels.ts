import { GenerationMode, OutputLayout } from '../types';

export const TEXT_FAST_MODEL = 'gemini-flash-lite-latest';
export const VISION_ANALYSIS_MODEL = 'gemini-flash-lite-latest';
export const IMAGE_FAST_MODEL = 'gemini-3.1-flash-lite-image';
export const IMAGE_DEFAULT_MODEL = 'gemini-3.1-flash-image';
export const IMAGE_PREMIUM_MODEL = 'gemini-3-pro-image';

export const GENERATION_MODE_LABELS: Record<GenerationMode, string> = {
  fast: 'Fast Preview',
  studio: 'Studio Quality',
  pro: 'Pro / 4K',
};

export const OUTPUT_LAYOUT_LABELS: Record<OutputLayout, string> = {
  single: 'Single Reveal',
  'salon-sheet': 'Salon Sheet',
  'before-after': 'Before / After',
};

export const getImageModelForMode = (mode: GenerationMode = 'studio') => {
  if (mode === 'fast') return IMAGE_FAST_MODEL;
  if (mode === 'pro') return IMAGE_PREMIUM_MODEL;
  return IMAGE_DEFAULT_MODEL;
};
