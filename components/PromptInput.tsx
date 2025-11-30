
import React, { useRef, useState } from 'react';
import { Edit3, Dices, X, Youtube, ImageIcon, Link as LinkIcon, Wand2, Play, Trash2 } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onImageUpload: (base64: string | null) => void;
  image: string | null;
  onUrlAdd: (url: string | null) => void;
  url: string | null;
  onSubmit?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
  label?: React.ReactNode;
  enableSurpriseMe?: boolean;
  onSurpriseMe?: () => void;
  submitLabel?: string;
  inputClassName?: string;
}

const getYoutubeMeta = (url: string) => {
  if (!url) return { id: null, isYoutube: false };
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  return { id, isYoutube: !!id };
};

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onImageUpload,
  image,
  onUrlAdd,
  url,
  onSubmit,
  isGenerating = false,
  placeholder = "Describe your look...",
  label,
  enableSurpriseMe = false,
  onSurpriseMe,
  submitLabel = "Generate",
  inputClassName = "min-h-[80px]"
}) => {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { id: ytId, isYoutube } = getYoutubeMeta(url || '');
  const ytThumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLink = () => {
    if (tempLink.trim()) {
      onUrlAdd(tempLink.trim());
      setTempLink('');
      setIsLinkInputOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full group">
      {/* Header / Label */}
      <div className="flex justify-between items-end mb-2 px-1">
        <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {label || (
            <>
              <Edit3 size={14} className="text-primary-500" />
              Describe details
            </>
          )}
        </label>
        {enableSurpriseMe && onSurpriseMe && (
          <button
            onClick={onSurpriseMe}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md transition-colors"
          >
            <Dices size={14} /> Surprise Me
          </button>
        )}
      </div>

      <div className={`
        relative shadow-lg rounded-xl bg-white dark:bg-gray-900 border transition-all duration-200
        ${isGenerating ? 'opacity-70 pointer-events-none' : ''}
        border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500
      `}>
        
        {/* Input Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 pt-4 pb-2 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 font-medium resize-none ${inputClassName}`}
          disabled={isGenerating}
        />

        {/* New Enhanced Media Cards Area */}
        {(image || url) && (
          <div className="px-4 pb-4 animate-fadeIn">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Image Card */}
                {image && (
                  <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group/card">
                     <img src={image} alt="Reference" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                     <div className="absolute bottom-2 left-3">
                        <p className="text-white text-xs font-bold flex items-center gap-1.5">
                            <ImageIcon size={12} /> Reference Photo
                        </p>
                     </div>
                     <button 
                        onClick={() => onImageUpload(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover/card:opacity-100"
                        title="Remove photo"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
                )}

                {/* Video/URL Card */}
                {url && (
                   <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 group/card">
                      {ytThumbnail ? (
                        <>
                          <img src={ytThumbnail} alt="Video Thumbnail" className="w-full h-full object-cover opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                <Play size={20} fill="currentColor" />
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                             <div className="flex flex-col items-center gap-2 text-gray-400">
                                <LinkIcon size={24} />
                                <span className="text-xs font-medium">Linked Content</span>
                             </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      
                      <div className="absolute bottom-2 left-3 right-10">
                         <p className="text-white text-xs font-bold flex items-center gap-1.5">
                             {isYoutube ? <Youtube size={12} className="text-red-500" /> : <LinkIcon size={12} />}
                             {isYoutube ? 'YouTube Inspiration' : 'Style Link'}
                         </p>
                         <p className="text-gray-300 text-[10px] truncate w-full opacity-80">{url}</p>
                      </div>

                      <button 
                        onClick={() => onUrlAdd(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover/card:opacity-100"
                        title="Remove link"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* Toolbar / Actions Footer */}
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 rounded-b-xl">
            <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                  title="Upload Reference Photo"
                  disabled={isGenerating}
                >
                  <ImageIcon size={16} className="text-blue-500" />
                  <span>Reference Photo</span>
                </button>

                <button
                  onClick={() => setIsLinkInputOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                  title="Link Video Style"
                  disabled={isGenerating}
                >
                  <LinkIcon size={16} className="text-red-500" />
                  <span>Video URL</span>
                </button>
            </div>

            {/* Submit Button (if active) */}
            {onSubmit && (
                <button 
                    onClick={onSubmit}
                    disabled={(!value && !image && !url) || isGenerating}
                    className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm
                        ${value || image || url 
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Wand2 size={14} />}
                    {submitLabel}
                </button>
            )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* URL Input Popover */}
        {isLinkInputOpen && (
          <div className="absolute bottom-full left-0 mb-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-scaleIn origin-bottom-left w-full max-w-sm">
             <div className="p-3">
                <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-2">Paste Video Link (YouTube/TikTok)</label>
                <div className="flex gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={tempLink}
                        onChange={(e) => setTempLink(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button
                        onClick={handleAddLink}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"
                    >
                        Add
                    </button>
                </div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-b-lg border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500">We analyze the style vibe from the video.</span>
                 <button onClick={() => setIsLinkInputOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[10px] font-medium px-2">Cancel</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
