import React, { useState, useMemo } from 'react';
import { RotateCcw, Download, History, Calendar, Edit3, Sparkles, Share2 } from 'lucide-react';
import { GeneratedImage } from '../types';
import { PromptInput } from './PromptInput';
import { MarkdownText } from './MarkdownText';
import { LoadingSpinner } from './LoadingSpinner';
import { HistoryItem } from './HistoryItem';
import { RefinementTools, REFINEMENT_TOOLS } from './RefinementTools';

interface StepResultProps {
  result: GeneratedImage;
  history: GeneratedImage[];
  onHistorySelect: (item: GeneratedImage) => void;
  onRestart: () => void;
  onRefine: (text: string, refImage: string | null, refUrl: string | null) => Promise<void>;
  isRefining: boolean;
  onCtaClick: (type: 'book' | 'pro') => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  onApplyStyle: (style: string) => void;
}

export const StepResult: React.FC<StepResultProps> = ({ 
  result, 
  history, 
  onHistorySelect, 
  onRestart, 
  onRefine,
  isRefining,
  onCtaClick,
  onDeleteHistoryItem,
  onApplyStyle
}) => {
  const [refinementText, setRefinementText] = useState('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refUrl, setRefUrl] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `hairstyle-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitRefinement = () => {
    if ((!refinementText.trim() && !refImage && !refUrl) || isRefining) return;
    onRefine(refinementText, refImage, refUrl);
    setRefinementText('');
    setRefImage(null);
    setRefUrl(null);
  };

  const toggleRefinement = (option: string) => {
    setRefinementText(prev => {
      const lowerPrev = prev.toLowerCase();
      const lowerOption = option.toLowerCase();
      
      if (lowerPrev.includes(lowerOption)) {
        // Remove option
        const regex = new RegExp(`(^|,\\s*)${option}(,\\s*|$)`, 'i');
        let newVal = prev.replace(regex, (match, p1, p2) => {
           if (p1 && p2) return ', '; 
           return '';
        }).trim();
        return newVal.replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/,\s*,/g, ',');
      } else {
        // Add option
        return prev ? `${prev}, ${option}` : option;
      }
    });
  };

  const selectedRefinements = useMemo(() => {
    const lowerText = refinementText.toLowerCase();
    const allOptions = REFINEMENT_TOOLS.flatMap(tool => tool.options);
    return allOptions.filter(opt => lowerText.includes(opt.toLowerCase()));
  }, [refinementText]);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fadeIn pb-24 lg:pb-12 px-1">
      
      {/* Sidebar: History (Desktop) */}
      <div className="hidden lg:block lg:col-span-3 order-2 lg:order-1 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base mb-2">
            <History size={18} /> Your Collection
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item) => (
                <HistoryItem 
                  key={item.id}
                  item={item}
                  isSelected={result.id === item.id}
                  onSelect={onHistorySelect}
                  onDelete={onDeleteHistoryItem}
                />
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 order-1 lg:order-2 space-y-4 sm:space-y-6">
        
        {/* Mobile History Filmstrip (Ultra-compact horizontal scroll) */}
        {history.length > 1 && (
          <div className="lg:hidden space-y-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold text-xs pl-1">
                <History size={14} /> History ({history.length} versions)
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 snap-x hide-scrollbar">
                {history.map((item) => (
                    <div key={item.id} className="snap-start shrink-0 w-32">
                      <HistoryItem 
                        item={item}
                        isSelected={result.id === item.id}
                        onSelect={onHistorySelect}
                        onDelete={onDeleteHistoryItem}
                      />
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* Top Desktop Actions Bar (Hidden on Mobile) */}
        <div className="hidden sm:flex flex-wrap gap-4 justify-between items-center glass-panel p-4 rounded-2xl shadow-soft">
            <button
                onClick={onRestart}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-sm"
            >
                <RotateCcw size={16} /> <span>Start New Look</span>
            </button>
            <div className="flex gap-2">
                <button
                    onClick={() => onCtaClick('book')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-md transition-all"
                >
                    <Calendar size={16} /> <span>Book Stylist</span>
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm shadow-glow hover:shadow-lg transition-all"
                >
                    <Download size={16} /> Save Image
                </button>
            </div>
        </div>

        {/* Main Render Image Card */}
        <div className="glass-panel hover-lift rounded-2xl p-2 shadow-xl relative overflow-hidden group">
            <img 
                src={result.url} 
                alt="New Hairstyle Result" 
                className="w-full h-auto rounded-xl"
            />
            
            {/* Title Overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs border border-white/10 max-w-[80%]">
               <MarkdownText text={result.title || "Generated Style"} className="font-semibold truncate block" />
            </div>

            {/* Improving Indicator Overlay */}
            {result.isImproving && (
              <div className="absolute bottom-4 right-4 bg-primary-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-primary-500 flex items-center gap-2 shadow-lg animate-pulse">
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                <span>Improving resolution (1K)...</span>
              </div>
            )}

            {/* Refining Loading Overlay */}
            {isRefining && (
              <div className="absolute inset-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-fadeIn">
                <LoadingSpinner 
                  message="Refining hairstyle..."
                  subMessage="This will update the version"
                  size="md"
                />
              </div>
            )}
        </div>

        {/* Refinement Panel */}
        <div className="bg-white/80 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-5 border border-slate-200/40 dark:border-slate-800 shadow-soft">
            <PromptInput 
                value={refinementText}
                onChange={setRefinementText}
                onImageUpload={setRefImage}
                image={refImage}
                onUrlAdd={setRefUrl}
                url={refUrl}
                onSubmit={submitRefinement}
                isGenerating={isRefining}
                inputClassName="min-h-[60px]"
                label={
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                         <Edit3 size={12} /> Refine / Tweak Style
                    </span>
                }
                placeholder="Describe adjustments (e.g. 'shorten the bangs', 'dye it honey blonde')..."
                submitLabel="Refine"
            />
            
            <RefinementTools 
              selectedOptions={selectedRefinements}
              onToggle={toggleRefinement}
              disabled={isRefining}
            />
        </div>

      </div>

      {/* Sticky Bottom Actions on Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-45 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-850 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] sm:hidden">
          <div className="p-4 flex gap-2">
            <button
                type="button"
                onClick={onRestart}
                className="p-3 rounded-xl border border-slate-250 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Start New"
            >
                <RotateCcw size={16} />
            </button>
            <button
                type="button"
                onClick={() => onCtaClick('book')}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5"
            >
                <Calendar size={14} />
                <span>Book Stylist</span>
            </button>
            <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10"
            >
                <Download size={14} />
                <span>Save Image</span>
            </button>
          </div>
      </div>

    </div>
  );
};
