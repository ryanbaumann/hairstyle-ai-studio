import React, { useEffect, useState } from 'react';
import { RefreshCw, Wand2, Dices } from 'lucide-react';
import { generateStyleSuggestions } from '../services/geminiService';
import { HairstyleOption } from '../types';

interface HairstyleSelectorProps {
  onSelect: (style: string) => void;
  selectedStyle: string;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
}

// Minimalist Presets
const PRESET_STYLES: HairstyleOption[] = [
    { 
        id: 'p1', 
        label: 'Platinum Bob', 
        description: 'Sleek, chin-length bob in icy platinum blonde.', 
        category: 'style'
    },
    { 
        id: 'p2', 
        label: 'Fiery Waves', 
        description: 'Long, voluminous beach waves in vibrant copper red.', 
        category: 'style'
    },
    { 
        id: 'p3', 
        label: 'Jet Black Pixie', 
        description: 'Edgy, textured pixie cut in deep black.', 
        category: 'style'
    },
    { 
        id: 'p4', 
        label: 'Pastel Pink Lob', 
        description: 'Shoulder-length long bob with soft pink pastel tones.', 
        category: 'color'
    },
];

const LUCKY_STYLES = [
  "Modern shag cut with curtain bangs and soft copper highlights",
  "Sleek glass hair bob with a sharp center part in dark espresso",
  "Textured wolf cut with subtle lavender tips and messy volume",
  "Classic Hollywood waves in a rich chocolate brown with high shine",
  "Edgy undercut pixie in platinum blonde with a swept-back style",
  "Boho braids with loose waves and caramel balayage",
  "Voluminous 90s blowout with face-framing layers",
  "Asymmetrical bob with a hidden vibrant blue underlayer"
];

export const HairstyleSelector: React.FC<HairstyleSelectorProps> = ({ 
  onSelect, 
  selectedStyle, 
  customPrompt,
  setCustomPrompt
}) => {
  const [suggestions, setSuggestions] = useState<HairstyleOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Combine Presets and Generated Suggestions
  const allSuggestions = [...PRESET_STYLES, ...suggestions];

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const newSuggestions = await generateStyleSuggestions("modern, stylish, diverse looks for 2025");
      setSuggestions(newSuggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLucky = () => {
    const randomStyle = LUCKY_STYLES[Math.floor(Math.random() * LUCKY_STYLES.length)];
    setCustomPrompt(randomStyle);
    onSelect(randomStyle);
  };

  useEffect(() => {
    // Ideally we might fetch this only if the user requests "More", 
    // but fetching on mount populates the list immediately.
    fetchSuggestions();
  }, []);

  return (
    <div className="space-y-10">
      
      {/* 1. Primary Input - The "Hero" Interaction */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="block text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Describe your look
          </label>
          <button 
            onClick={handleLucky}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg border border-primary-100 dark:border-primary-800"
          >
            <Dices size={16} />
            I'm feeling lucky
          </button>
        </div>
        
        <div className="relative group">
            <textarea
                value={customPrompt}
                onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    onSelect(e.target.value);
                }}
                placeholder="e.g. A futuristic neon bob with shaved sides..."
                className="w-full p-6 rounded-2xl bg-white dark:bg-gray-800 text-lg text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none h-32"
            />
            <div className="absolute bottom-4 right-4 text-gray-300 dark:text-gray-600">
                <Wand2 size={20} />
            </div>
        </div>
      </div>

      {/* 2. Suggestions - Horizontal Scroll Strip */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Suggestions & Inspiration
            </h3>
            <button 
                onClick={fetchSuggestions}
                disabled={loading}
                className="flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                Shuffle
            </button>
        </div>

        <div className="relative -mx-4 px-4">
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide">
                {/* Loading Skeletons */}
                {loading && suggestions.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex-none w-64 h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                ))}

                {/* Cards */}
                {!loading && allSuggestions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            const val = `${option.label} - ${option.description}`;
                            onSelect(val);
                            setCustomPrompt(val);
                        }}
                        className={`
                            flex-none w-64 p-5 rounded-2xl text-left transition-all snap-start border relative overflow-hidden group
                            ${selectedStyle.includes(option.label)
                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'}
                        `}
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <span className={`
                                    inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3
                                    ${selectedStyle.includes(option.label) 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                `}>
                                    {option.category}
                                </span>
                                <h4 className="font-bold text-lg leading-tight mb-1">{option.label}</h4>
                                <p className={`text-sm leading-snug line-clamp-3 ${selectedStyle.includes(option.label) ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            
            {/* Fade indicators for scroll */}
            <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent pointer-events-none md:hidden"></div>
        </div>
      </div>
    </div>
  );
};