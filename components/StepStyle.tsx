
import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Edit3, X, Plus } from 'lucide-react';
import { PromptInput } from './PromptInput';
import { PresetImage } from './PresetImage';
import { STYLE_PRINCIPLES, STYLES, LUCKY_PROMPTS } from '../data/styleOptions';

interface StepStyleProps {
  onSelect: (style: string) => void;
  selectedStyle: string;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  styleReferenceImage: string | null;
  onStyleImageChange: (base64: string | null) => void;
  styleReferenceUrl: string | null;
  onStyleUrlChange: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepStyle: React.FC<StepStyleProps> = ({
  onSelect,
  selectedStyle,
  customPrompt,
  setCustomPrompt,
  styleReferenceImage,
  onStyleImageChange,
  styleReferenceUrl,
  onStyleUrlChange,
  onNext,
  onBack
}) => {

  const [inputValue, setInputValue] = useState(customPrompt || selectedStyle);

  useEffect(() => {
    setInputValue(customPrompt || selectedStyle);
  }, [selectedStyle, customPrompt]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setCustomPrompt(val);
    onSelect(val);
  };

  const handleAddToken = (token: string) => {
    let newVal = inputValue.trim();
    const tokenLower = token.toLowerCase();
    
    // Check if token already exists (simple check)
    const exists = newVal.toLowerCase().includes(tokenLower);
    
    if (exists) {
      // Remove token if it exists (rudimentary removal)
      const regex = new RegExp(`(^|,\\s*)${token}(,\\s*|$)`, 'i');
      newVal = newVal.replace(regex, (match, p1, p2) => {
        if (p1 && p2) return ', '; // Kept between two other tokens
        return ''; // At beginning or end
      }).trim();
      
      // Clean up multiple commas or trailing/leading commas
      newVal = newVal.replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/,\s*,/g, ',');
    } else {
      // Add token
      if (!newVal) {
        newVal = token;
      } else {
        newVal = `${newVal}, ${token}`;
      }
    }
    handleInputChange(newVal);
  };

  const handleLucky = () => {
    const prompt = LUCKY_PROMPTS[Math.floor(Math.random() * LUCKY_PROMPTS.length)];
    setInputValue(prompt);
    setCustomPrompt(prompt);
    onSelect(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-32">

      {/* Sticky Prompt Input Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-md pt-4 pb-2 mb-2 -mx-4 px-4 border-b border-gray-200/50 dark:border-gray-800/50 transition-all shadow-sm">
        <PromptInput
          value={inputValue}
          onChange={handleInputChange}
          onImageUpload={onStyleImageChange}
          image={styleReferenceImage}
          onUrlAdd={onStyleUrlChange}
          url={styleReferenceUrl}
          enableSurpriseMe={true}
          onSurpriseMe={handleLucky}
          label={
            <>
              <Edit3 size={14} className="text-primary-500" />
              Describe your look <span className="text-gray-400 font-normal hidden sm:inline">- combine styles below</span>
            </>
          }
          placeholder="e.g. A short, wavy blonde bob with curtain bangs..."
        />
      </div>

      {/* Style Builder Section */}
      <div className="mb-10 space-y-6">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles size={16} className="text-purple-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Build Your Style</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STYLE_PRINCIPLES.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                <category.icon size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{category.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.options.map((option) => {
                  const isSelected = inputValue.toLowerCase().includes(option.toLowerCase());
                  return (
                    <button
                      key={option}
                      onClick={() => handleAddToken(option)}
                      className={`
                        text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 flex items-center gap-1 group
                        ${isSelected 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-100 dark:hover:bg-gray-800'}
                        border
                      `}
                    >
                      {option}
                      {isSelected ? (
                        <X size={10} className="text-primary-500" />
                      ) : (
                        <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condensed Presets Grid */}
      <div className="space-y-8">
        {STYLES.map((section) => (
          <div key={section.category}>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 pl-1">
              {section.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {section.items.map((item) => {
                const itemString = `${item.label} - ${item.desc}`;
                const isSelected = inputValue === itemString || inputValue.includes(item.label);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const val = `${item.label} - ${item.desc}`;
                      setInputValue(val);
                      setCustomPrompt('');
                      onSelect(val);
                    }}
                    className={`
                      relative group aspect-[4/3] rounded-xl overflow-hidden text-left transition-all duration-300
                      ${isSelected
                        ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 shadow-xl shadow-primary-500/10'
                        : 'hover:shadow-md opacity-90 hover:opacity-100'}
                    `}
                  >
                    <PresetImage src={item.img} alt={item.label} />

                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`} />

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-white font-bold text-sm leading-tight mb-0.5">{item.label}</h4>
                      <p className="text-gray-300 text-[10px] leading-tight line-clamp-1">{item.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-scaleIn">
                        <Sparkles size={12} fill="currentColor" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Footer Action */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-4 py-2 font-medium text-sm"
          >
            Back
          </button>
          <button
            disabled={!selectedStyle && !styleReferenceImage && !styleReferenceUrl && !inputValue}
            onClick={onNext}
            className={`
                    flex-1 sm:flex-none sm:w-64 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base transition-all
                    ${(selectedStyle || styleReferenceImage || styleReferenceUrl || inputValue)
                ? 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 transform active:scale-95'
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}
                `}
          >
            <Wand2 size={18} className={(selectedStyle || styleReferenceImage || styleReferenceUrl || inputValue) ? "animate-pulse" : ""} />
            <span>Transform Now</span>
          </button>
        </div>
      </div>

    </div>
  );
};
