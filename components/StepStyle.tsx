
import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Edit3, X, Plus, Check } from 'lucide-react';
import { generateStyleSuggestions, analyzeUserImage } from '../services/geminiService';
import { PromptInput } from './PromptInput';
import { StyleGrid } from './StyleGrid';
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
  userImage?: string | null;
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
  userImage,
  onNext,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Women' | 'Men'>('All');
  const [inputValue, setInputValue] = useState(customPrompt || selectedStyle);

  useEffect(() => {
    setInputValue(customPrompt || selectedStyle);
  }, [selectedStyle, customPrompt]);

  // Auto-detect gender & recommend style for better initial defaults
  useEffect(() => {
    const analyze = async () => {
      if (userImage) {
        try {
          const { gender, recommendedStyleId } = await analyzeUserImage(userImage);
          if (gender !== 'All') {
            setActiveTab(gender);
          }
          
          if (recommendedStyleId) {
             // Find the style details
             const allItems = STYLES.flatMap(s => s.items);
             const match = allItems.find(i => i.id === recommendedStyleId);
             if (match) {
                 const val = `${match.label} - ${match.desc}`;
                 setInputValue(val);
                 setCustomPrompt(''); // Clear custom if we are applying a preset
                 onSelect(val);
             }
          }
        } catch (e) {
            console.warn("Auto-analysis failed", e);
        }
      }
    };
    analyze();
  }, [userImage]);

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

  const filteredStyles = STYLES.filter(section => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Women') return section.category.includes('Women');
    if (activeTab === 'Men') return section.category.includes('Men');
    return true;
  });

  const hasContent = selectedStyle || styleReferenceImage || styleReferenceUrl || inputValue;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-32">

      {/* Sticky Prompt Input Bar */}
      <div className="sticky top-20 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl py-4 mb-6 -mx-4 px-6 border-b border-gray-200/50 dark:border-gray-800/50 transition-all shadow-sm">
        <div className="flex gap-4 items-start">
             {/* Use Photo Context */}
             {userImage && (
                <div className="hidden sm:block shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                        <img src={userImage} alt="You" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-1 font-medium">Original</p>
                </div>
             )}

            <div className="flex-1">
                <PromptInput
                value={inputValue}
                onChange={handleInputChange}
                onImageUpload={onStyleImageChange}
                image={styleReferenceImage}
                onUrlAdd={onStyleUrlChange}
                url={styleReferenceUrl}
                enableSurpriseMe={true}
                onSurpriseMe={handleLucky}
                onSubmit={onNext}
                submitLabel="Transform Now"
                label={
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <Edit3 size={16} />
                    <span className="font-bold">Describe your look</span>
                    <span className="text-gray-400 font-normal hidden sm:inline">- combine styles below</span>
                    </div>
                }
                placeholder="e.g. A short, wavy blonde bob with curtain bangs..."
                />
            </div>
        </div>
      </div>

      {/* 1. SELECTION PAGE - VIBES SELECTION (LEAD WITH IMAGES) */}
      <StyleGrid 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedStyle={inputValue}
        onSelect={(val) => {
            const fullVal = val;
            setInputValue(fullVal);
            setCustomPrompt('');
            onSelect(fullVal);
        }}
      />

      <div className="h-px bg-gray-100 dark:bg-slate-800 my-12" />

      {/* 2. STYLE BUILDER - CUSTOMIZATION SECTION */}
      <div className="mb-8 space-y-6">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles size={16} className="text-purple-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Refine & Build Your Look</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STYLE_PRINCIPLES.map((category) => (
            <div key={category.id} className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-1.5 mb-3 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800 pb-2">
                <category.icon size={14} className="text-primary-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{category.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.options.map((option) => {
                  const isSelected = inputValue.toLowerCase().includes(option.toLowerCase());
                  return (
                    <button
                      key={option}
                      onClick={() => handleAddToken(option)}
                      className={`
                        text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 border
                        ${isSelected 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-500/20' 
                          : 'bg-gray-50/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-white dark:hover:bg-slate-800'}
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile-only Back/Transform Footer (Desktop uses the one in PromptInput) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:hidden">
          <div className="p-4 flex gap-3">
            <button
                onClick={onBack}
                className="px-4 py-3 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
                Back
            </button>
            <button
                disabled={!hasContent}
                onClick={onNext}
                className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all
                    ${hasContent 
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 animate-pulse ring-2 ring-primary-500/20' 
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}
                `}
            >
                <Wand2 size={18} /> Transform Now
            </button>
          </div>
      </div>

    </div>
  );
};
