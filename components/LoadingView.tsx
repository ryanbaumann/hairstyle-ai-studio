import React, { useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Sparkles, Terminal, Activity, Lock, Cpu } from 'lucide-react';

interface LoadingViewProps {
  userImage?: string | null;
  prompt?: string;
  thoughts?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ 
  userImage, 
  prompt, 
  thoughts = "" 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [thoughts]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn flex flex-col md:flex-row gap-6 items-stretch md:h-[600px] min-h-[500px]">
      
      {/* Left: Scanning Visualization */}
      <div className="flex-1 bg-black/5 dark:bg-black/20 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-800 shadow-inner flex flex-col">
        {userImage ? (
          <div className="relative h-full min-h-[300px] w-full bg-black">
             {/* Source Image */}
            <img 
               src={userImage} 
               alt="Scanning" 
               className="w-full h-full object-cover opacity-60"
            />
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-scan"></div>
            
            {/* HUD Elements */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-primary-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-primary-500/30">
               <Activity size={12} className="animate-pulse" />
               <span>ANALYZING GEOMETRY</span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-mono text-primary-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-primary-500/30">
               <Cpu size={12} className="animate-spin-slow" />
               <span>GEMINI 3 IMAGE</span>
            </div>
            
             {/* Center Spinner/Status */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full border border-white/10 shadow-xl flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs font-bold text-white tracking-widest uppercase animate-pulse">Scanning</span>
                 </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
             <LoadingSpinner size="lg" message="Initializing..." />
          </div>
        )}
      </div>

      {/* Right: Terminal / Thought Process */}
      <div className="flex-1 bg-[#0d1117] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col font-mono text-xs md:text-sm">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-gray-800">
           <div className="flex items-center gap-2 text-gray-400">
               <Terminal size={14} />
               <span className="font-bold text-gray-200">GEMINI NANO BANNA MODEL</span>
           </div>
           <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
           </div>
        </div>

        {/* Console Output */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto space-y-2 text-gray-300 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          <div className="text-gray-500 mb-4">
             // Session started: {new Date().toLocaleTimeString()}
             <br/>
             // Target: {prompt || "Unknown Style"}
          </div>

          {thoughts ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                  {thoughts.split('\n').map((line, i) => (
                      <div key={i} className={`${line.startsWith('-') || line.startsWith('*') ? 'text-blue-300' : 'text-gray-300'} mb-1`}>
                          <span className="text-gray-600 mr-2 opacity-50">$</span>
                          {line}
                      </div>
                  ))}
                  <span className="inline-block w-2 h-4 bg-primary-500 ml-1 animate-pulse align-middle"></span>
              </div>
          ) : (
             <div className="flex items-center gap-2 text-gray-500 italic">
                <span className="w-2 h-2 bg-gray-600 rounded-full animate-ping"></span>
                Connecting to neural engine...
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 bg-[#161b22] border-t border-gray-800 text-[10px] text-gray-500 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
                <Lock size={10} />
                <span>E2E ENCRYPTED STREAM</span>
            </div>
            <span>v3.0.0-preview</span>
        </div>
      </div>

    </div>
  );
};
