
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

const PREVIEW_IMAGE_DATA = "images/optimized/sample-hairstyle.jpg";

export const StepUpload: React.FC<StepUploadProps> = ({ images, history, onUpload, onClear, onNext, onJumpToResult }) => {
  return (
    <div className="max-w-[1400px] mx-auto animate-fadeIn pb-24 md:pb-12 px-4 md:px-8 relative">

      {/* Split Hero: Left Text/Visual, Right Action Grid */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">

        {/* Left: Copy & Value Props */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left pt-0 lg:sticky lg:top-24">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
              Reinvent your look <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">in seconds.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Try on trending styles from photos or videos to find your perfect cut. Compare looks, choose your favorite, and make your next styling decision amazing.
            </p>
          </div>

          {/* Visual Example Card - Now Visible on Mobile */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 max-w-md mx-auto lg:max-w-none">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider ml-auto">
                Preview Mode: Vibrant Copper
              </div>
            </div>
            <div className="w-full aspect-video relative group overflow-hidden bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <img
                src={PREVIEW_IMAGE_DATA}
                alt="Hairstyle Outcome Preview"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4 opacity-70">
            <div className="flex items-center gap-2">
              <Scan size={18} className="text-indigo-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Face Mapping</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-purple-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">360° Matrix</span>
            </div>
          </div>
        </div>

        {/* Right: The Action Area */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white dark:bg-gray-900/50 p-5 md:p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800">
            
            {/* Resume Session Section */}
            {history && history.length > 0 && (
              <div className="mb-6 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10">
                    {history[0].url && history[0].url.startsWith('data:') ? (
                      <img src={history[0].url} alt="Last generated" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900 dark:to-indigo-900">
                        <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Resume Session</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{history.length} generated images</p>
                  </div>
                </div>
                <button
                  onClick={() => onJumpToResult(history[0])}
                  className="mr-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all whitespace-nowrap"
                >
                  View Results
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 1: The Canvas</h2>
                <p className="text-sm text-gray-500 mt-1">Upload at least one photo.</p>
              </div>
              <span className="text-[10px] font-bold text-primary-700 bg-primary-100 dark:bg-primary-900/50 dark:text-primary-300 px-3 py-1 rounded-full whitespace-nowrap border border-primary-200 dark:border-primary-800">
                Required: Front
              </span>
            </div>

            {/* Image Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">
              <ImageUpload
                view="front"
                image={images.front}
                onUpload={onUpload}
                onClear={onClear}
                required
              />
              <ImageUpload
                view="side"
                image={images.side}
                onUpload={onUpload}
                onClear={onClear}
              />
              <ImageUpload
                view="back"
                image={images.back}
                onUpload={onUpload}
                onClear={onClear}
              />
            </div>

            {/* Desktop CTA (Hidden on Mobile if we want sticky, but keeping it visible as spacer/fallback) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 pb-20 sm:pb-0">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                Photos are processed securely in memory <br className="hidden sm:block" /> and are never stored permanently.
              </p>
              <button
                disabled={!images.front}
                onClick={onNext}
                className={`
                            hidden sm:flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg
                            ${images.front
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed shadow-none'}
                        `}
              >
                Choose Your Style <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer CTA */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 sm:hidden transition-transform duration-300
        ${images.front ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <button
          disabled={!images.front}
          onClick={onNext}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white text-lg shadow-lg bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow-primary-500/25 active:scale-[0.98]"
        >
          Choose Your Style <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
