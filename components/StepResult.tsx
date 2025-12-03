
import React, { useState, useMemo } from 'react';
import { RotateCcw, Download, History, Calendar, Edit3 } from 'lucide-react';
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
}

export const StepResult: React.FC<StepResultProps> = ({ 
  result, 
  history, 
  onHistorySelect, 
  onRestart, 
  onRefine,
  isRefining,
  onCtaClick,
  onDeleteHistoryItem
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

  // Derive selected refinements from text for visual feedback
  const selectedRefinements = useMemo(() => {
    const lowerText = refinementText.toLowerCase();
    const allOptions = REFINEMENT_TOOLS.flatMap(tool => tool.options);
    return allOptions.filter(opt => lowerText.includes(opt.toLowerCase()));
  }, [refinementText]);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn pb-12">
      
      {/* Sidebar: History (Desktop) */}
      <div className="hidden lg:block lg:col-span-3 order-2 lg:order-1 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg mb-2">
            <History size={20} /> Your Collection
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
      <div className="lg:col-span-9 order-1 lg:order-2 space-y-8">
        
        {/* Mobile History (Horizontal Scroll) */}
        <div className="lg:hidden space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm">
              <History size={16} /> Your Collection
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x custom-scrollbar">
              {history.map((item) => (
                  <div key={item.id} className="snap-start shrink-0 w-48">
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

        {/* Top Actions */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <button
                onClick={onRestart}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
                <RotateCcw size={18} /> <span className="hidden sm:inline">Start New Look</span><span className="sm:hidden">New</span>
            </button>
            <div className="flex gap-3">
                <button
                    onClick={() => onCtaClick('book')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-opacity"
                >
                    <Calendar size={18} /> <span className="hidden sm:inline">Book Stylist</span>
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg shadow-primary-500/20 transition-all"
                >
                    <Download size={18} /> Save Image
                </button>
            </div>
        </div>

        {/* Main Image */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-2xl shadow-black/10 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <img 
                src={result.url} 
                alt="New Hairstyle Result" 
                className="w-full h-auto rounded-xl"
            />
            
            {/* Title Overlay */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm border border-white/20">
               <MarkdownText text={result.title || "Generated Style"} className="font-medium" />
            </div>

            {/* Refining Overlay */}
            {isRefining && (
              <div className="absolute inset-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 animate-fadeIn">
                <LoadingSpinner 
                  message="Refining your look..."
                  subMessage="Applying changes"
                  size="md"
                />
              </div>
            )}
        </div>

        {/* Refinement / Edit Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
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
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                         <Edit3 size={14} /> Refine & Perfect
                    </span>
                }
                placeholder="Describe changes (e.g. 'Make it shorter', 'Add highlights')..."
                submitLabel="Update"
            />
            
            <RefinementTools 
              selectedOptions={selectedRefinements}
              onToggle={toggleRefinement}
              disabled={isRefining}
            />
        </div>

      </div>
    </div>
  );
};
