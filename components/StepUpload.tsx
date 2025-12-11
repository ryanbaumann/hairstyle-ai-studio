
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Scan, Layers, ImageOff } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { UploadedImages, ViewType, GeneratedImage } from '../types';

interface StepUploadProps {
  images: UploadedImages;
  history?: GeneratedImage[];
  onUpload: (view: ViewType, base64: string) => void;
  onClear: (view: ViewType) => void;
  onNext: () => void;
  onJumpToResult: (result: GeneratedImage) => void;
}

// Using the images from the reference HTML for the carousel/preview
const PREVIEW_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB867EDnyWooX1XbHR4DzA-2wsiYwXWoUd7CFPTgetB3znTRUGickoKiYxHGNIooU0cWUAXf3ImP-QdrSJ7Cwf4admTYA0jtsxqQF_eejlc48oAe-uQzV1gLxr_r9Kzbog7n8iu_K0Xe_IUpmFY1alnXrsFdyUh0z6rlG57SYtGWNshq-zYtC-h7ik14pu0_9bOoqLnlqZevDGSeLZIAgrcfqOnVrTn42c0p4BmyFuVHUlM3S1uyhfjEyeDWjg0W71lpbZGTkejoQx2",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC3JP9GcL8oVNPzIuNtzmkCADBsiKk5FMp3SkoRIe_y8-KUMTf2DREvLdBHVEZjZUa9fufxzyZPtWb-ehBQbCEDaJlTB6a3WzTjSUuapnW8pwETTITtDQZ_W3TQEnPItJ2_WvwQmW4ukeevNDRuSk15XCGn3kBTMQNWRXlcLNwT3tlwYG1kN-0Pip9oju3hBq7G96CrxIexzjpegpUxXzTgYDLqalajC4janpCCvOF9byHW429zMb9r9YYa1G8pm2ZJhEBSDDDvjNB3",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBvhj1_bJZHXWlWBp8hyZhsj0AwNmW-TGG09_WTC9tG_VMwi7F7fxKTKkn-jPoKQUAs4OcM1RckDoHVV2hcbvRF-_LzV3ZU3keN4s2CkneEwZkXjwZqGSfqi7I_Xon6rbY3E4BcJemUEegiXoflqWdABP2mfY4Nj8ODgW06MKkrOybNJcIIBrBpKH-jNhJpYphFyt555QFNgI5mnAYxvYl7ty0vhl5f6OTZGpadMEsERgZsKuKT8dYFLV71SRW-o1dN63mOv87pCX8n"
];

export const StepUpload: React.FC<StepUploadProps> = ({ images, history, onUpload, onClear, onNext, onJumpToResult }) => {
  return (
    <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
      
      {/* Left Column: Hero & Preview */}
      <div className="w-full lg:w-5/12 flex flex-col gap-8">
            <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white">
                    Reinvent your look <br />
                    <span className="text-gradient">in seconds.</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Try on trending styles from photos or videos to find your perfect cut. Compare looks, choose your favorite, and make your next styling decision amazing.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Preview Mode: Vibrant Copper</span>
                    <div className="w-8"></div> 
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="grid grid-cols-3 gap-2 h-48 sm:h-64">
                         {PREVIEW_IMAGES.map((src, i) => (
                            <div key={i} className="relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 h-full">
                                <img 
                                    src={src} 
                                    alt={`Preview view ${i+1}`} 
                                    className={`object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-700 ${i === 2 ? 'transform scale-x-[-1]' : ''}`} 
                                />
                            </div>
                         ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-8 justify-center lg:justify-start pt-2">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <span className="material-icons text-primary">center_focus_weak</span>
                    Face Mapping
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <span className="material-icons text-primary">view_in_ar</span>
                    360° Matrix
                </div>
            </div>
      </div>

      {/* Right Column: Upload Canvas */}
      <div className="w-full lg:w-7/12">
            <div className="bg-card-light dark:bg-card-dark rounded-3xl p-8 shadow-soft dark:shadow-none border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Step 1: The Canvas</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload at least one photo.</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                        Required: Front
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                         <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Front View</span>
                         <ImageUpload
                            view="front"
                            image={images.front}
                            onUpload={onUpload}
                            onClear={onClear}
                            required
                        />
                    </div>
                     <div className="flex flex-col gap-2">
                         <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Side View</span>
                         <ImageUpload
                            view="side"
                            image={images.side}
                            onUpload={onUpload}
                            onClear={onClear}
                        />
                    </div>
                     <div className="flex flex-col gap-2">
                         <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Back View</span>
                         <ImageUpload
                            view="back"
                            image={images.back}
                            onUpload={onUpload}
                            onClear={onClear}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 max-w-xs text-center sm:text-left">
                        Photos are processed securely in memory and are never stored permanently.
                    </p>
                    <button 
                        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all 
                            ${images.front 
                                ? 'bg-primary text-white shadow-glow hover:shadow-lg hover:bg-primary-dark cursor-pointer' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-500 cursor-not-allowed'}`}
                        disabled={!images.front}
                        onClick={onNext}
                    >
                        Choose Your Style
                        <span className="material-icons text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Resume Session Block (Custom Addition preserving existing functionality) */}
            {history && history.length > 0 && (
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        You have {history.length} generated styles in this session.
                     </span>
                     <button 
                        onClick={() => onJumpToResult(history[0])}
                        className="text-primary hover:text-primary-dark font-semibold text-sm hover:underline"
                    >
                        View History
                     </button>
                </div>
            )}
      </div>
    </div>
  );
};
