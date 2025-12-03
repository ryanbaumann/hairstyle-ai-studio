
import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Camera, Image as ImageIcon, RotateCcw, Aperture } from 'lucide-react';
import { ViewType } from '../types';

interface ImageUploadProps {
  view: ViewType;
  image: string | null;
  onUpload: (view: ViewType, base64: string) => void;
  onClear: (view: ViewType) => void;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ view, image, onUpload, onClear, required }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream cleanup
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  // Start camera effect
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false 
        });
        
        if (mounted && isCameraOpen) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Play is async and can fail if element is removed
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          }
        } else {
          // Clean up if component unmounted or mode changed during load
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (mounted) {
          setCameraError("Could not access camera. Please check permissions.");
        }
      }
    };

    if (isCameraOpen) {
      startCamera();
    }

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Match the video dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally if using front camera to mirror user expectation
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        onUpload(view, base64);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(view, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderGuidanceOverlay = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full p-8 text-white stroke-2 stroke-current fill-none">
          {view === 'front' && (
             <ellipse cx="100" cy="90" rx="45" ry="60" strokeDasharray="5,5" />
          )}
          {view === 'side' && (
             <path d="M 80,30 Q 130,30 130,90 Q 130,150 90,170" strokeDasharray="5,5" />
          )}
          {view === 'back' && (
             <path d="M 60,170 Q 50,150 50,100 Q 50,30 100,30 Q 150,30 150,100 Q 150,150 140,170" strokeDasharray="5,5" />
          )}
        </svg>
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs font-semibold drop-shadow-md">
           {view === 'front' ? 'Center your face' : view === 'side' ? 'Turn to the side' : 'Turn around'}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-fadeIn">
      <div className="flex justify-between items-center px-1">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-200 capitalize flex items-center gap-2">
          {view} View {required && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
        </label>
        {image && (
          <button
            onClick={() => onClear(view)}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md transition-colors"
          >
            <X size={12} /> Remove
          </button>
        )}
      </div>

      <div className={`
          relative overflow-hidden rounded-2xl border-2 transition-all duration-300 aspect-[3/4] w-full shadow-sm group
          ${image || isCameraOpen 
            ? 'border-primary-500 bg-black shadow-primary-500/20 border-solid' 
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 border-dashed hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
        `}>
        
        {/* State 1: Image Display */}
        {image && (
          <>
            <img 
              src={image} 
              alt={`${view} view`} 
              className="w-full h-full object-cover" 
            />
            <div 
              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm"
              onClick={() => onClear(view)}
            >
              <span className="text-white font-bold flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                <RotateCcw size={18} /> Reset Photo
              </span>
            </div>
          </>
        )}

        {/* State 2: Camera Active */}
        {!image && isCameraOpen && (
          <div className="relative w-full h-full bg-black">
             {cameraError ? (
               <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                 <p className="text-white text-sm mb-4 bg-red-500/20 p-3 rounded-lg border border-red-500/50">{cameraError}</p>
                 <button onClick={stopCamera} className="text-white text-sm font-medium hover:underline">Cancel Camera</button>
               </div>
             ) : (
               <>
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted 
                   className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                 />
                 {renderGuidanceOverlay()}
                 <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10 pointer-events-auto">
                    <button 
                      onClick={stopCamera}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                    >
                      <X size={24} />
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="p-1.5 rounded-full border-4 border-white/80 hover:scale-105 hover:border-white transition-all shadow-lg"
                    >
                      <div className="w-14 h-14 bg-white rounded-full"></div>
                    </button>
                    <div className="w-12"></div> {/* Spacer for balance */}
                 </div>
               </>
             )}
          </div>
        )}

        {/* State 3: Empty / Selection Mode */}
        {!image && !isCameraOpen && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400">
               {view === 'front' ? <Camera size={24} /> : <ImageIcon size={24} />}
             </div>
             
             <div className="text-center space-y-0.5 mb-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Add {view} Photo</p>
                <p className="text-[10px] text-gray-400">JPG or PNG</p>
             </div>
             
             {/* Updated button grid: tighter gap, reduced padding */}
             <div className="grid grid-cols-2 gap-2 w-full">
               <button
                 onClick={() => setIsCameraOpen(true)}
                 className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-300 transition-colors font-semibold text-xs"
               >
                  <Camera size={14} />
                  Camera
               </button>
               
               <button
                 onClick={() => inputRef.current?.click()}
                 className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors font-semibold text-xs"
               >
                  <Upload size={14} />
                  Upload
               </button>
             </div>
          </div>
        )}
        
        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
