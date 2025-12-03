import React from 'react';
import { X } from 'lucide-react';
import { GeneratedImage } from '../types';
import { MarkdownText } from './MarkdownText';

interface HistoryItemProps {
  item: GeneratedImage;
  isSelected: boolean;
  onSelect: (item: GeneratedImage) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, isSelected, onSelect, onDelete }) => (
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
