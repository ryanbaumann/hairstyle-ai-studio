import React, { useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { StepUpload } from './components/StepUpload';
import { StepStyle } from './components/StepStyle';
import { StepResult } from './components/StepResult';
import { MarketingModal } from './components/MarketingModal';
import { LoadingView } from './components/LoadingView';
import { useAppFlow } from './hooks/useAppFlow';
import { Sparkles, Scissors, ShieldCheck, ChevronRight, Star } from 'lucide-react';

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
    navigateTo,
    currentThoughts,
    refinementPrompt
  } = useAppFlow();

  // Navigation Logic Helpers
  const canGoToUpload = true;
  const canGoToStyle = !!state.images.front || state.history.length > 0;
  const canGoToResult = !!state.generatedResult;

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
    <div className="h-[100dvh] overflow-hidden bg-background-light dark:bg-background-dark bg-ambient text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">

      {/* Navbar */}
      <nav className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('upload')}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Scissors size={18} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800 dark:text-gray-100">HairStyle AI</span>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 gap-1.5">
           <button 
             onClick={() => navigateTo('upload')}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${state.step === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
           >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${state.step === 'upload' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>1</span>
                Upload
           </button>
           <ChevronRight size={12} className="text-slate-400" />
           <button 
             onClick={() => navigateTo('style')}
             disabled={!canGoToStyle}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${state.step === 'style' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400'} ${canGoToStyle && state.step !== 'style' ? 'hover:text-primary dark:hover:text-primary' : ''} ${!canGoToStyle ? 'opacity-40 cursor-not-allowed' : ''}`}
           >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${state.step === 'style' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</span>
                Style
           </button>
           <ChevronRight size={12} className="text-slate-400" />
           <button 
             onClick={() => navigateTo('result')}
             disabled={!canGoToResult}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${state.step === 'result' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400'} ${canGoToResult && state.step !== 'result' ? 'hover:text-primary dark:hover:text-primary' : ''} ${!canGoToResult ? 'opacity-40 cursor-not-allowed' : ''}`}
           >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${state.step === 'result' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>3</span>
                Reveal
           </button>
        </div>

        <div className="flex items-center gap-2">
            <ThemeToggle />
        </div>
      </nav>

      {/* Mobile-first compact Stepper Bar (Context always visible) */}
      <div className="md:hidden flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/40 dark:border-slate-800 py-1.5 gap-2 text-[10px] font-bold tracking-wider uppercase text-slate-450 dark:text-slate-400">
         <button onClick={() => navigateTo('upload')} className={state.step === 'upload' ? 'text-primary' : ''}>1. Upload</button>
         <ChevronRight size={10} className="text-slate-400" />
         <button onClick={() => navigateTo('style')} disabled={!canGoToStyle} className={`${state.step === 'style' ? 'text-primary' : ''} ${!canGoToStyle ? 'opacity-50' : ''}`}>2. Style</button>
         <ChevronRight size={10} className="text-slate-400" />
         <button onClick={() => navigateTo('result')} disabled={!canGoToResult} className={`${state.step === 'result' ? 'text-primary' : ''} ${!canGoToResult ? 'opacity-50' : ''}`}>3. Reveal</button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <main className="max-w-6xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 flex-1 w-full">
          {state.errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 shadow-sm dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-250">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1 text-xs">
                <p className="font-bold">Error detail</p>
                <p>{state.errorMessage}</p>
              </div>
              <button onClick={() => setState(prev => ({ ...prev, errorMessage: null }))} className="text-xs font-bold hover:underline">Dismiss</button>
            </div>
          )}
          
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
              userImage={state.images.front}
              onNext={() => handleGenerate()}
              onBack={() => setState(prev => ({ ...prev, step: 'upload' }))}
              generationMode={state.generationMode}
              onGenerationModeChange={(generationMode) => setState(prev => ({ ...prev, generationMode }))}
              outputLayout={state.outputLayout}
              onOutputLayoutChange={(outputLayout) => setState(prev => ({ ...prev, outputLayout }))}
            />
          )}

          {(state.step === 'generating' || isRefining) && (
            <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark overflow-y-auto">
               <div className="min-h-screen p-4 flex flex-col">
                  <LoadingView 
                    userImage={isRefining ? state.generatedResult?.url : state.images.front}
                    prompt={isRefining ? refinementPrompt : (state.customPrompt || state.selectedStyle)}
                    thoughts={currentThoughts}
                  />
               </div>
            </div>
          )}

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
              onApplyStyle={(style) => {
                  setState(prev => ({ ...prev, selectedStyle: style }));
                  handleGenerate(style);
              }}
            />
          )}
        </main>

        {/* Pro Banner - Only shown on Result page to reduce scrolling and noise during upload/style steps */}
        <div className="container mx-auto px-4 sm:px-6 pb-6 mt-auto">
          {state.step === 'result' && (
            <div className="w-full bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between shadow-md text-white mb-4 animate-fadeIn">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                        <Star size={20} className="text-amber-300" fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm sm:text-base">Unlock Pro Features</h3>
                        <p className="text-xs text-indigo-100">Get access to 4K resolution and advanced hairstyle features.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setState(prev => ({ ...prev, isMarketingModalOpen: true }))}
                    className="bg-white text-primary hover:bg-indigo-50 font-bold py-2 px-5 rounded-xl transition-colors shadow-sm text-xs whitespace-nowrap w-full sm:w-auto"
                >
                    Join Waitlist
                </button>
            </div>
          )}
          <footer className="text-center py-4 text-[10px] text-slate-400">
              © {new Date().getFullYear()} Hairstyle AI Studio. All rights reserved.
          </footer>
        </div>
      </div>

      <MarketingModal
        isOpen={state.isMarketingModalOpen}
        onClose={() => setState(prev => ({ ...prev, isMarketingModalOpen: false }))}
      />
    </div>
  );
};
