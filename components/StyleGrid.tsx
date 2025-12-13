import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { STYLES } from '../data/styleOptions';
import { PresetImage } from './PresetImage';

interface StyleGridProps {
  onSelect: (style: string) => void;
  selectedStyle?: string;
  activeTab: 'All' | 'Women' | 'Men';
  onTabChange: (tab: 'All' | 'Women' | 'Men') => void;
  title?: string;
}

export const StyleGrid: React.FC<StyleGridProps> = ({
  onSelect,
  selectedStyle = '',
  activeTab,
  onTabChange,
  title
}) => {
  const filteredStyles = STYLES.filter(section => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Women') return section.category.includes('Women');
    if (activeTab === 'Men') return section.category.includes('Men');
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div className="flex space-x-4 items-center">
            {title && <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{title}</h3>}
            <div className="flex gap-2">
            {(['All', 'Women', 'Men'] as const).map((tab) => (
                <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-white dark:bg-slate-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800'
                }`}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium hidden sm:block">Select a vibe to start</p>
      </div>

      <div className="space-y-10">
        {filteredStyles.map((section) => (
          <div key={section.category} className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              {section.category}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((item) => {
                const isSelected = (selectedStyle || '').includes(item.label);

                return (
                  <div
                    key={item.id}
                    className={`
                      relative group rounded-3xl overflow-hidden text-left bg-white dark:bg-slate-900 border transition-all duration-500
                      ${isSelected
                        ? 'ring-4 ring-primary-500/20 border-primary-500 shadow-2xl scale-[1.02] z-10'
                        : 'border-gray-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-800 hover:shadow-xl hover:scale-[1.01]'}
                    `}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <PresetImage src={item.img} alt={item.label} />
                      <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                      
                      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                        <button
                          onClick={() => {
                            const val = `${item.label} - ${item.desc}`;
                            onSelect(val);
                          }}
                          className={`
                            px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-lg
                            ${isSelected 
                              ? 'bg-white text-primary' 
                              : 'bg-primary text-white hover:bg-primary-600'}
                          `}
                        >
                          <Sparkles size={14} fill={isSelected ? 'currentColor' : 'none'} />
                          {isSelected ? 'Applied' : 'Try This Vibe'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 relative">
                      <h4 className="text-gray-900 dark:text-white font-black text-sm leading-tight mb-1">{item.label}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-[10px] leading-snug line-clamp-2">{item.desc}</p>
                      
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-primary animate-bounce">
                           <Check size={16} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
