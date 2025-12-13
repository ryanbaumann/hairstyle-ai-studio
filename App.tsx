
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">

      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('upload')}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <span className="material-icons text-xl">content_cut</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-gray-100">HairStyle AI</span>
        </div>

        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1.5 gap-2">
           <button 
             onClick={() => navigateTo('upload')}
             className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all ${state.step === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
           >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${state.step === 'upload' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>1</span>
                Upload
           </button>
           <span className="material-icons text-slate-400 text-xs">chevron_right</span>
           <button 
             onClick={() => navigateTo('style')}
             disabled={!canGoToStyle}
             className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all ${state.step === 'style' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400'} ${canGoToStyle && state.step !== 'style' ? 'hover:text-primary dark:hover:text-primary' : ''} ${!canGoToStyle ? 'opacity-40 cursor-not-allowed' : ''}`}
           >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${state.step === 'style' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</span>
                Style
           </button>
           <span className="material-icons text-slate-400 text-xs">chevron_right</span>
           <button 
             onClick={() => navigateTo('result')}
             disabled={!canGoToResult}
             className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all ${state.step === 'result' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary cursor-default' : 'text-slate-500 dark:text-slate-400'} ${canGoToResult && state.step !== 'result' ? 'hover:text-primary dark:hover:text-primary' : ''} ${!canGoToResult ? 'opacity-40 cursor-not-allowed' : ''}`}
           >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${state.step === 'result' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>3</span>
                Reveal
           </button>
        </div>

        <div className="flex items-center gap-2">
            <ThemeToggle />
        </div>
      </nav>

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
            userImage={state.images.front}
            onNext={handleGenerate}
            onBack={() => setState(prev => ({ ...prev, step: 'upload' }))}
          />
        )}

        {(state.step === 'generating' || isRefining) && (
          <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark overflow-y-auto">
             {/* Re-use Navbar for consistency or just fullscreen overlay? 
                 The request implies "same loading experience".
                 The original was inline. 
                 If we want it to look EXACTLY the same, we should probably just render it in place of content or overlay.
                 Let's do an overlay to cover the Result screen.
             */}
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

      {/* Pro Banner Footer */}
      {/* Pro Banner Footer */}
       <div className="container mx-auto px-6 pb-6 mt-auto">
        <div className="w-full bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-lg text-white">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                    <span className="material-icons text-amber-300">star</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Unlock Pro Features</h3>
                    <p className="text-sm text-indigo-100">Get access to 4K resolution and advanced features.</p>
                </div>
            </div>
            <button 
                onClick={() => setState(prev => ({ ...prev, isMarketingModalOpen: true }))}
                className="bg-white text-primary hover:bg-indigo-50 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto"
            >
                Join Waitlist
            </button>
        </div>
        <footer className="text-center py-6 text-xs text-slate-400">
            © {new Date().getFullYear()} Hairstyle AI Studio. All rights reserved.
        </footer>
       </div>

      <MarketingModal
        isOpen={state.isMarketingModalOpen}
        onClose={() => setState(prev => ({ ...prev, isMarketingModalOpen: false }))}
      />
    </div>
  );
};

const ScissorsIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);
