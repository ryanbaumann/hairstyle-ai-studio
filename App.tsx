
import React, { useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { StepUpload } from './components/StepUpload';
import { StepStyle } from './components/StepStyle';
import { StepResult } from './components/StepResult';
import { MarketingModal } from './components/MarketingModal';
import { LoadingView } from './components/LoadingView';
import { useAppFlow } from './hooks/useAppFlow';
import { Sparkles, ChevronRight, Check, Trash2, Star } from 'lucide-react';

export const App = () => {
  const {
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
  } = useAppFlow();

  // Navigation Logic Helpers
  const canGoToUpload = true;
  const canGoToStyle = state.step === 'style' || state.step === 'result' || state.step === 'generating';
  const canGoToResult = state.step === 'result';

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
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
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-20">
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
            onHistorySelect={(item) => setState(prev => ({ ...prev, generatedResult: item }))}
            onRestart={() => setState(prev => ({ ...prev, step: 'upload' }))}
            onRefine={handleRefine}
            isRefining={isRefining}
            onCtaClick={() => setState(prev => ({ ...prev, isMarketingModalOpen: true }))}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        )}
      </main>

      {/* Pro Banner Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-transparent mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-900 dark:to-indigo-900 rounded-xl px-4 py-2.5 text-white flex items-center justify-between gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Star size={60} />
              </div>
              <div className="relative z-10 flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Star className="text-yellow-300 fill-yellow-300" size={18} /> 
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                        Unlock Pro Features
                    </h3>
                    <p className="text-indigo-100 text-[10px] leading-tight max-w-md hidden sm:block">
                        Get access to 4K resolution and advanced features.
                    </p>
                  </div>
              </div>
              <button 
                  onClick={() => setState(prev => ({ ...prev, isMarketingModalOpen: true }))}
                  className="relative z-10 px-4 py-1.5 bg-white text-primary-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-sm"
              >
                  Join Waitlist
              </button>
          </div>
          <div className="mt-4 text-center text-[10px] text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Hairstyle AI Studio. All rights reserved.
          </div>
        </div>
      </footer>

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
