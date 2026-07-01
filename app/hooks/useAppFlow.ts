import React, { useState, useEffect, useCallback } from 'react';
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
    generationMode: 'fast',
    outputLayout: 'single',
    errorMessage: null,
  });

  const [isRefining, setIsRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [currentThoughts, setCurrentThoughts] = useState("");

  // API Key Check
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHasKey(data.hasApiKey);
      } catch (err) {
        // Fallback to true in local vite dev without proxy setup yet, or assume false
        setHasKey(!!import.meta.env.VITE_GEMINI_API_KEY);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    setState(prev => ({ ...prev, errorMessage: "API Keys are managed on the server. Please add GEMINI_API_KEY to the server environment." }));
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
    } else {
      localStorage.removeItem('hairstyle_history');
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

  const handleGenerate = async (styleOverride?: string) => {
    if (!state.images.front) return;
    setState(prev => ({ ...prev, step: 'generating' }));
    setCurrentThoughts(""); // Clear previous thoughts

    const promptToUse = styleOverride || state.selectedStyle || state.customPrompt;

    try {
      // 1. Start title generation in parallel
      const titlePromise = generateTitleFromPrompt(promptToUse);

      // 2. Generate 0.5K preview
      const previewImageUrl = await generateHairstyleImage(
        state.images,
        promptToUse,
        state.styleReferenceImage,
        state.styleReferenceUrl,
        (thought) => setCurrentThoughts(prev => prev + thought),
        state.generationMode,
        state.outputLayout,
        "0.5K"
      );

      const title = await titlePromise;
      const targetId = Date.now().toString();

      const newResult: GeneratedImage = {
        id: targetId,
        url: previewImageUrl,
        prompt: promptToUse,
        title: title,
        timestamp: Date.now(),
        generationMode: state.generationMode,
        outputLayout: state.outputLayout,
        isImproving: true
      };

      await saveImage(targetId, previewImageUrl);

      setState(prev => ({
        ...prev,
        step: 'result',
        generatedResult: newResult,
        history: [newResult, ...prev.history]
      }));

      // 3. Kick off the 1K final version in the background
      generateHairstyleImage(
        state.images,
        promptToUse,
        state.styleReferenceImage,
        state.styleReferenceUrl,
        undefined,
        state.generationMode,
        state.outputLayout,
        "1K"
      ).then(async (finalImageUrl) => {
        await saveImage(targetId, finalImageUrl);
        setState(prev => {
          const updatedResult = prev.generatedResult && prev.generatedResult.id === targetId
            ? { ...prev.generatedResult, url: finalImageUrl, isImproving: false }
            : prev.generatedResult;
          const updatedHistory = prev.history.map(item =>
            item.id === targetId ? { ...item, url: finalImageUrl, isImproving: false } : item
          );
          return { ...prev, generatedResult: updatedResult, history: updatedHistory };
        });
      }).catch(err => {
        console.warn("Background 1K generation failed, keeping preview", err);
        setState(prev => {
          const updatedResult = prev.generatedResult && prev.generatedResult.id === targetId
            ? { ...prev.generatedResult, isImproving: false }
            : prev.generatedResult;
          const updatedHistory = prev.history.map(item =>
            item.id === targetId ? { ...item, isImproving: false } : item
          );
          return { ...prev, generatedResult: updatedResult, history: updatedHistory };
        });
      });

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, step: 'style', errorMessage: 'Generation failed. Please check your Gemini key, image inputs, and network, then try again.' }));
    }
  };

  const handleRefine = async (instruction: string, refImage: string | null = null, refUrl: string | null = null) => {
    if (!state.generatedResult) return;
    setIsRefining(true);
    setRefinementPrompt(instruction);
    setCurrentThoughts(""); // Clear thoughts

    const targetId = Date.now().toString();
    const currentUrlForRefinement = state.generatedResult.url;

    try {
      const titlePromise = generateTitleFromPrompt(instruction);

      // 1. Generate 0.5K preview
      const previewImageUrl = await refineHairstyleImage(
        currentUrlForRefinement,
        instruction,
        refImage,
        refUrl,
        (thought) => setCurrentThoughts(prev => prev + thought),
        state.generationMode,
        state.outputLayout,
        "0.5K"
      );

      const title = await titlePromise;

      const newResult: GeneratedImage = {
        id: targetId,
        url: previewImageUrl,
        prompt: instruction,
        title: title,
        timestamp: Date.now(),
        generationMode: state.generationMode,
        outputLayout: state.outputLayout,
        isImproving: true
      };

      await saveImage(targetId, previewImageUrl);

      setState(prev => ({
        ...prev,
        generatedResult: newResult,
        history: [newResult, ...prev.history]
      }));

      setIsRefining(false); // Hide full loading screen so user can see preview

      // 2. Generate 1K final image in the background
      refineHairstyleImage(
        currentUrlForRefinement,
        instruction,
        refImage,
        refUrl,
        undefined,
        state.generationMode,
        state.outputLayout,
        "1K"
      ).then(async (finalImageUrl) => {
        await saveImage(targetId, finalImageUrl);
        setState(prev => {
          const updatedResult = prev.generatedResult && prev.generatedResult.id === targetId
            ? { ...prev.generatedResult, url: finalImageUrl, isImproving: false }
            : prev.generatedResult;
          const updatedHistory = prev.history.map(item =>
            item.id === targetId ? { ...item, url: finalImageUrl, isImproving: false } : item
          );
          return { ...prev, generatedResult: updatedResult, history: updatedHistory };
        });
      }).catch(err => {
        console.warn("Background 1K refinement failed, keeping preview", err);
        setState(prev => {
          const updatedResult = prev.generatedResult && prev.generatedResult.id === targetId
            ? { ...prev.generatedResult, isImproving: false }
            : prev.generatedResult;
          const updatedHistory = prev.history.map(item =>
            item.id === targetId ? { ...item, isImproving: false } : item
          );
          return { ...prev, generatedResult: updatedResult, history: updatedHistory };
        });
      });

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, errorMessage: 'Refinement failed. Try a simpler instruction or a different reference image.' }));
      setIsRefining(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  const handleClearHistory = async () => {
    await clearAllImages();
    localStorage.removeItem('hairstyle_history');
    setState(prev => ({ ...prev, history: [], generatedResult: null, step: 'upload' }));
  };

  const navigateTo = (target: 'upload' | 'style' | 'result') => {
    if (state.step === 'generating') return;

    const canGoToUpload = true;
    const canGoToStyle = !!state.images.front || state.history.length > 0;
    const canGoToResult = !!state.generatedResult;

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
    navigateTo,
    currentThoughts,
    refinementPrompt
  };
};
