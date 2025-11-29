
import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, Scissors, Edit3, Image as ImageIcon, Link as LinkIcon, X, Youtube, Plus, Palette, Ruler, Waves, LayoutGrid } from 'lucide-react';
import { PromptInput } from './PromptInput';

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

const STYLE_PRINCIPLES = [
  {
    id: 'length',
    label: 'Length',
    icon: Ruler,
    options: ['Pixie', 'Short', 'Chin-length', 'Shoulder-length', 'Mid-back', 'Long', 'Buzz Cut', 'Bald']
  },
  {
    id: 'texture',
    label: 'Texture',
    icon: Waves,
    options: ['Straight', 'Wavy', 'Curly', 'Coily', 'Messy', 'Layered', 'Choppy', 'Sleek']
  },
  {
    id: 'color',
    label: 'Color',
    icon: Palette,
    options: ['Platinum Blonde', 'Honey Blonde', 'Brunette', 'Jet Black', 'Copper Red', 'Silver', 'Pastel Pink', 'Neon Blue', 'Balayage', 'Ombre']
  },
  {
    id: 'style',
    label: 'Key Styles',
    icon: LayoutGrid,
    options: ['Bob', 'Lob', 'Shag', 'Mullet', 'Wolf Cut', 'Curtain Bangs', 'Fade', 'Undercut', 'French Bob', 'Beach Waves']
  }
];

const STYLES = [
  {
    category: "Trending Women",
    items: [
      {
        id: 'butterfly-cut',
        label: 'Butterfly Cut',
        desc: 'Voluminous, heavily layered 90s blowout',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/butterfly-cut-woman.jpeg'
      },
      {
        id: 'cowgirl-copper',
        label: 'Cowgirl Copper',
        desc: 'Long waves in warm, reddish-brown tones',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/cowgirl-copper-woman.jpeg'
      },
      {
        id: 'italian-bob',
        label: 'Italian Bob',
        desc: 'Chin-length, blunt tips with airy volume',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/italian-bob-woman.jpeg'
      },
    ]
  },
  {
    category: "Trending Men",
    items: [
      {
        id: 'modern-mullet',
        label: 'Modern Mullet',
        desc: 'Textured back, shorter sides, contemporary fade',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/modern-mullet-man.jpeg'
      },
      {
        id: 'textured-crop',
        label: 'Textured Crop',
        desc: 'Skin fade with choppy, matte textured top',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/textured-crop-man.jpeg'
      },
      {
        id: 'the-flow',
        label: 'The Flow',
        desc: 'Medium length, pushed back, natural waves',
        img: 'https://storage.googleapis.com/vibecoding-assets/ai-hairstyle-nov25/the-flow-man.jpeg'
      },
    ]
  }
];

const LUCKY_PROMPTS = [
  "A futuristic cyberpunk bob with neon blue streaks",
  "Vintage 1950s hollywood glamour waves",
  "A wild, textured wolf cut with silver tips",
  "Braided crown with loose wisps framing the face"
];

const PresetImage = ({ src, alt }: { src: string, alt: string }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center text-primary-300 dark:text-gray-700">
        <Scissors size={32} className="mb-2 opacity-50" />
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
};

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
    if (!newVal) {
      newVal = token;
    } else {
      // Avoid duplicate tokens if simple check passes
      if (!newVal.toLowerCase().includes(token.toLowerCase())) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STYLE_PRINCIPLES.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                <category.icon size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{category.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAddToken(option)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group"
                  >
                    {option}
                    <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                  </button>
                ))}
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
