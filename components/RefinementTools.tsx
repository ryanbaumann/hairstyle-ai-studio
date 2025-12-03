import React from 'react';
import { Ruler, Palette, Layers, Scissors } from 'lucide-react';

export const REFINEMENT_TOOLS = [
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

interface RefinementToolsProps {
  selectedOptions: string[];
  onToggle: (option: string) => void;
  disabled?: boolean;
}

export const RefinementTools: React.FC<RefinementToolsProps> = ({ selectedOptions, onToggle, disabled }) => {
  return (
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
                  onClick={() => onToggle(option)}
                  disabled={disabled}
                  className={`
                    text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap
                    ${selectedOptions.includes(option)
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
  );
};
