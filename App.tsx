
import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { StepUpload } from './components/StepUpload';
import { StepStyle } from './components/StepStyle';
import { StepResult } from './components/StepResult';
import { MarketingModal } from './components/MarketingModal';
import { generateHairstyleImage, refineHairstyleImage, generateTitleFromPrompt } from './services/geminiService';
import { saveImage, getImage, clearAllImages } from './services/imageStorage';
import { AppState, GeneratedImage, ViewType } from './types';
import { Sparkles, Scissors, Loader2, ChevronRight, Check, Zap, Trash2 } from 'lucide-react';

// Simplified, Faster Loading View (20s)
const LoadingView = () => {
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  const MESSAGES = [
    "Analyzing facial structure...",
    "Mapping 3D features...",
    "Generating hair volume...",
    "Applying texture & color...",
    "Optimizing lighting...",
    "Finalizing your new look..."
  ];

  useEffect(() => {
    const totalTime = 20000; // 20 seconds
    const intervalTime = 100;
    const steps = totalTime / intervalTime;

    const timer = setInterval(() => {
      setProgress(p => Math.min(p + (100 / steps), 100));
    }, intervalTime);

    const messageTimer = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % MESSAGES.length);
    }, totalTime / MESSAGES.length);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center py-32 animate-fadeIn select-none">

      {/* Sleek Progress Ring - Fixed SVG ViewBox to prevent cutting off */}
      <div className="relative w-32 h-32 mx-auto mb-10">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 128 128"
        >
          {/* Background Circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress Circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={364} // 2 * pi * 58
            strokeDashoffset={364 - (364 * progress) / 100}
            className="text-primary-600 transition-all duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-primary-500 animate-pulse" size={32} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 min-h-[2rem] transition-all">
        {MESSAGES[messageIdx]}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {progress < 100 ? "This usually takes about 20 seconds." : "Almost there! Still working..."}
      </p>
    </div>
  );
};

export const App = () => {
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

  // Persistence Logic
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

  useEffect(() => {
    if (state.history.length > 0) {
      // Save metadata to localStorage, but keep base64 out of it if possible
      // Actually, we can store the ID and a placeholder, and store the real image in IndexedDB
      const metadataOnly = state.history.map(item => ({
        ...item,
        url: item.id // Use ID as placeholder or keep it if it's already a URL. 
                     // Since we hydrate on load, this is fine.
      }));
      localStorage.setItem('hairstyle_history', JSON.stringify(metadataOnly));
    }
  }, [state.history]);

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

  const updateImages = (view: ViewType, base64: string) => {
    setState(prev => ({
      ...prev,
      images: { ...prev.images, [view]: base64 }
    }));
  };

  const clearImage = (view: ViewType) => {
    setState(prev => ({
      ...prev,
      images: { ...prev.images, [view]: null }
    }));
  };

  const handleGenerate = async () => {
    if (!state.images.front) return;
    setState(prev => ({ ...prev, step: 'generating' }));

    const promptToUse = state.selectedStyle || state.customPrompt;

    try {
      // Run generation and title summarization in parallel for better performance
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

      // Save to IndexedDB
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

      // Save to IndexedDB
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

  const handleHistorySelect = (item: GeneratedImage) => {
    setState(prev => ({ ...prev, generatedResult: item }));
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      const { deleteImage } = await import('./services/imageStorage');
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  // Navigation Logic
  const canGoToUpload = true;
  const canGoToStyle = state.step === 'style' || state.step === 'result' || state.step === 'generating';
  const canGoToResult = state.step === 'result';

  const navigateTo = (target: 'upload' | 'style' | 'result') => {
    if (state.step === 'generating') return; // Lock during generation

    if (target === 'upload' && canGoToUpload) {
      setState(prev => ({ ...prev, step: 'upload' }));
    } else if (target === 'style' && canGoToStyle) {
      setState(prev => ({ ...prev, step: 'style' }));
    } else if (target === 'result' && canGoToResult) {
      setState(prev => ({ ...prev, step: 'result' }));
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          {/* ... existing key prompt ... */}
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-primary-600 dark:text-primary-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to HairStyle AI</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            To generate high-quality hairstyles, we need to access the Gemini API. Please select a project to continue.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25"
          >
            Connect API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 font-sans selection:bg-primary-100 selection:text-primary-900">

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigateTo('upload')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <ScissorsIcon size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight hidden sm:block">HairStyle AI</span>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Interactive Progress Steps */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-full p-1">
              <NavStep
                label="Upload"
                stepNumber={1}
                isActive={state.step === 'upload'}
                isCompleted={state.step !== 'upload'}
                onClick={() => navigateTo('upload')}
              />
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 mx-1" />
              <NavStep
                label="Style"
                stepNumber={2}
                isActive={state.step === 'style'}
                isCompleted={state.step === 'result' || state.step === 'generating'}
                isDisabled={!canGoToStyle}
                onClick={() => navigateTo('style')}
              />
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 mx-1" />
              <NavStep
                label="Reveal"
                stepNumber={3}
                isActive={state.step === 'result' || state.step === 'generating'}
                isCompleted={false}
                isDisabled={!canGoToResult && state.step !== 'generating'}
                onClick={() => navigateTo('result')}
              />
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            {state.history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Clear History"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {state.step === 'upload' && (
          <StepUpload
            images={state.images}
            history={state.history}
            onUpload={updateImages}
            onClear={clearImage}
            onNext={() => setState(prev => ({ ...prev, step: 'style' }))}
            onJumpToResult={(result) => setState(prev => ({ ...prev, step: 'result', generatedResult: result }))}
          />
        )}

        {state.step === 'style' && (
          <StepStyle
            selectedStyle={state.selectedStyle}
            customPrompt={state.customPrompt}
            setCustomPrompt={(val) => setState(prev => ({ ...prev, customPrompt: val }))}
            onSelect={(style) => setState(prev => ({ ...prev, selectedStyle: style }))}
            styleReferenceImage={state.styleReferenceImage}
            onStyleImageChange={(val) => setState(prev => ({ ...prev, styleReferenceImage: val }))}
            styleReferenceUrl={state.styleReferenceUrl}
            onStyleUrlChange={(val) => setState(prev => ({ ...prev, styleReferenceUrl: val }))}
            onNext={handleGenerate}
            onBack={() => setState(prev => ({ ...prev, step: 'upload' }))}
          />
        )}

        {state.step === 'generating' && <LoadingView />}

        {state.step === 'result' && state.generatedResult && (
          <StepResult
            result={state.generatedResult}
            history={state.history}
            onHistorySelect={handleHistorySelect}
            onRestart={() => setState(prev => ({ ...prev, step: 'upload' }))}
            onRefine={handleRefine}
            isRefining={isRefining}
            onCtaClick={() => setState(prev => ({ ...prev, isMarketingModalOpen: true }))}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        )}
      </main>

      <MarketingModal
        isOpen={state.isMarketingModalOpen}
        onClose={() => setState(prev => ({ ...prev, isMarketingModalOpen: false }))}
      />
    </div>
  );
};

const NavStep = ({
  label,
  stepNumber,
  isActive,
  isCompleted,
  isDisabled,
  onClick
}: {
  label: string,
  stepNumber: number,
  isActive: boolean,
  isCompleted: boolean,
  isDisabled?: boolean,
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
            ${isActive ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : ''}
            ${!isActive && !isDisabled ? 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200' : ''}
            ${isDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
        `}
  >
    <span className={`
            flex items-center justify-center w-5 h-5 rounded-full text-[10px]
            ${isActive ? 'bg-primary-600 text-white' : ''}
            ${isCompleted ? 'bg-green-500 text-white' : ''}
            ${!isActive && !isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
        `}>
      {isCompleted ? <Check size={10} /> : stepNumber}
    </span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const ScissorsIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);
