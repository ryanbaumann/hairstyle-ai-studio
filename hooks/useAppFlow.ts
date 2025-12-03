import { useState, useEffect, useCallback } from 'react';
import { AppState, GeneratedImage, ViewType } from '../types';
import { generateHairstyleImage, refineHairstyleImage, generateTitleFromPrompt } from '../services/geminiService';
import { saveImage, getImage, clearAllImages, deleteImage } from '../services/imageStorage';

export const useAppFlow = () => {
  const [hasKey, setHasKey] = useState(false);
  const [state, setState] = useState<AppState>({
    step: 'upload',
    images: { front: null, side: null, back: null },
    selectedStyle: '',
    customPrompt: '',
    styleReferenceImage: null,
    styleReferenceUrl: null,
    generatedResult: null,
    history: [],
    theme: 'light',
    isMarketingModalOpen: false,
  });

  const [isRefining, setIsRefining] = useState(false);

  // API Key Check
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        setHasKey(!!import.meta.env.VITE_GEMINI_API_KEY);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  // Persistence: Load History
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = localStorage.getItem('hairstyle_history');
        if (saved) {
          const parsed: GeneratedImage[] = JSON.parse(saved);
          // Hydrate images from IndexedDB
          const hydratedHistory = await Promise.all(parsed.map(async (item) => {
            if (!item.url.startsWith('data:')) {
              const savedImage = await getImage(item.id);
              if (savedImage) {
                return { ...item, url: savedImage };
              }
            }
            return item;
          }));
          setState(prev => ({ ...prev, history: hydratedHistory }));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();
  }, []);

  // Persistence: Save History Metadata
  useEffect(() => {
    if (state.history.length > 0) {
      const metadataOnly = state.history.map(item => ({
        ...item,
        url: item.id // Use ID as placeholder
      }));
      localStorage.setItem('hairstyle_history', JSON.stringify(metadataOnly));
    }
  }, [state.history]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  // Actions
  const updateImages = useCallback((view: ViewType, base64: string) => {
    setState(prev => ({
      ...prev,
      images: { ...prev.images, [view]: base64 }
    }));
  }, []);

  const clearImage = useCallback((view: ViewType) => {
    setState(prev => ({
      ...prev,
      images: { ...prev.images, [view]: null }
    }));
  }, []);

  const handleGenerate = async () => {
    if (!state.images.front) return;
    setState(prev => ({ ...prev, step: 'generating' }));

    const promptToUse = state.selectedStyle || state.customPrompt;

    try {
      const [imageUrl, title] = await Promise.all([
        generateHairstyleImage(
          state.images,
          promptToUse,
          state.styleReferenceImage,
          state.styleReferenceUrl
        ),
        generateTitleFromPrompt(promptToUse)
      ]);

      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: promptToUse,
        title: title,
        timestamp: Date.now()
      };

      await saveImage(newResult.id, imageUrl);

      setState(prev => ({
        ...prev,
        step: 'result',
        generatedResult: newResult,
        history: [newResult, ...prev.history]
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate hairstyle. Please try again.");
      setState(prev => ({ ...prev, step: 'style' }));
    }
  };

  const handleRefine = async (instruction: string, refImage: string | null = null, refUrl: string | null = null) => {
    if (!state.generatedResult) return;
    setIsRefining(true);
    try {
      const [imageUrl, title] = await Promise.all([
        refineHairstyleImage(
          state.generatedResult.url,
          instruction,
          refImage,
          refUrl
        ),
        generateTitleFromPrompt(instruction)
      ]);

      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: instruction,
        title: title,
        timestamp: Date.now()
      };

      await saveImage(newResult.id, imageUrl);

      setState(prev => ({
        ...prev,
        generatedResult: newResult,
        history: [newResult, ...prev.history]
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to refine image.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteImage(id);
      setState(prev => {
        const newHistory = prev.history.filter(item => item.id !== id);
        let newGeneratedResult = prev.generatedResult;
        if (prev.generatedResult?.id === id) {
          newGeneratedResult = newHistory.length > 0 ? newHistory[0] : null;
        }
        return {
          ...prev,
          history: newHistory,
          generatedResult: newGeneratedResult,
          step: newHistory.length > 0 ? prev.step : 'upload'
        };
      });
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
      await clearAllImages();
      localStorage.removeItem('hairstyle_history');
      setState(prev => ({ ...prev, history: [], generatedResult: null, step: 'upload' }));
    }
  };

  const navigateTo = (target: 'upload' | 'style' | 'result') => {
    if (state.step === 'generating') return;

    const canGoToUpload = true;
    const canGoToStyle = state.step === 'style' || state.step === 'result' || state.step === 'generating';
    const canGoToResult = state.step === 'result';

    if (target === 'upload' && canGoToUpload) {
      setState(prev => ({ ...prev, step: 'upload' }));
    } else if (target === 'style' && canGoToStyle) {
      setState(prev => ({ ...prev, step: 'style' }));
    } else if (target === 'result' && canGoToResult) {
      setState(prev => ({ ...prev, step: 'result' }));
    }
  };

  return {
    state,
    setState,
    hasKey,
    handleSelectKey,
    updateImages,
    clearImage,
    handleGenerate,
    handleRefine,
    isRefining,
    handleDeleteHistoryItem,
    handleClearHistory,
    navigateTo
  };
};
