
import React, { useState } from 'react';
import { RotateCcw, Download, History, Calendar, Star, Loader2, Edit3, Scissors, Palette, Ruler, Layers, X } from 'lucide-react';
import { GeneratedImage } from '../types';
import { PromptInput } from './PromptInput';
import { MarkdownText } from './MarkdownText';
import { LoadingSpinner } from './LoadingSpinner';

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

const REFINEMENT_TOOLS = [
  { 
    id: 'length', 
    label: 'Length', 
    icon: Ruler,
    options: ['Trim ends', 'Shoulder length', 'Chin length', 'Short pixie', 'Long extensions'] 
  },
  { 
    id: 'color', 
    label: 'Color', 
    icon: Palette,
    options: ['Lighter', 'Darker', 'Warmer tone', 'Cooler tone', 'Add highlights', 'Root shadow'] 
  },
  { 
    id: 'texture', 
    label: 'Texture', 
    icon: Layers,
    options: ['More volume', 'Less volume', 'Smoother', 'Messier', 'Defined curls'] 
  },
  {
    id: 'cut',
    label: 'Cut Details',
    icon: Scissors,
    options: ['Add bangs', 'Curtain bangs', 'Face framing', 'Blunt cut', 'Razored edges']
  }
];

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
  const [selectedRefinements, setSelectedRefinements] = useState<string[]>([]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `hairstyle-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitRefinement = () => {
    const combinedText = [refinementText, ...selectedRefinements].filter(Boolean).join(', ');
    if ((!combinedText.trim() && !refImage && !refUrl) || isRefining) return;
    onRefine(combinedText, refImage, refUrl);
    setRefinementText('');
    setRefImage(null);
    setRefUrl(null);
    setSelectedRefinements([]);
  };

  const toggleRefinement = (option: string) => {
    setRefinementText(prev => {
      if (prev.includes(option)) {
        // Remove option and clean up commas
        return prev.replace(new RegExp(`,?\\s*${option}`), '').replace(/^,\s*/, '');
      } else {
        // Add option
        return prev ? `${prev}, ${option}` : option;
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn pb-12">
      
      {/* Sidebar: History (Desktop) */}
      <div className="hidden lg:block lg:col-span-3 order-2 lg:order-1 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg mb-2">
            <History size={20} /> Your Collection
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item, idx) => (
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
              {history.map((item, idx) => (
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
            
            {/* Title Overlay (if desired, or just show it in sidebar) - Adding distinct title here */}
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
            
            {/* Categorized Refinement Tools */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {REFINEMENT_TOOLS.map((tool) => (
                  <div key={tool.id} className="space-y-2">
                     <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        <tool.icon size={12} /> {tool.label}
                     </div>
                       <div className="flex flex-wrap md:flex-wrap gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-2 md:mx-0 px-2 md:px-0 snap-x hide-scrollbar">
                         {tool.options.map((option) => (
                            <div key={option} className="snap-start shrink-0 md:shrink">
                              <button
                                 onClick={() => toggleRefinement(option)}
                                 disabled={isRefining}
                                 className={`
                                   text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap
                                   ${refinementText.includes(option)
                                     ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                                     : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-300'}
                                 `}
                              >
                                 {option}
                              </button>
                            </div>
                         ))}
                       </div>
                  </div>
               ))}
            </div>
        </div>

        {/* Pro Banner removed from here, moved to App.tsx footer */}

      </div>
    </div>
  );
};

const HistoryItem: React.FC<{
  item: GeneratedImage;
  isSelected: boolean;
  onSelect: (item: GeneratedImage) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}> = ({ item, isSelected, onSelect, onDelete }) => (
  <button
      onClick={() => onSelect(item)}
      className={`
          w-full text-left rounded-xl overflow-hidden border transition-all relative group shadow-sm
          ${isSelected 
              ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10' 
              : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-800'}
      `}
  >
      <div className="flex gap-2 p-1.5">
          <img src={item.url} alt="Thumbnail" className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  <MarkdownText text={item.title?.split(' ').slice(0, 2).join(' ') || item.prompt.split('-')[0].split(' ').slice(0, 2).join(' ') || "Custom Look"} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {new Date(item.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'})} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
          </div>
          <button
            onClick={(e) => onDelete(item.id, e)}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Image"
          >
            <X size={12} />
          </button>
      </div>
  </button>
);
