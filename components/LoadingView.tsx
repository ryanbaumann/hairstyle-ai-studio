import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const MESSAGES = [
  "Analyzing facial structure...",
  "Mapping 3D features...",
  "Generating hair volume...",
  "Applying texture & color...",
  "Optimizing lighting...",
  "Finalizing your new look..."
];

export const LoadingView: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const totalTime = 20000; // 20 seconds
    const intervalTime = 100;
    const steps = totalTime / intervalTime;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return Math.min(p + (100 / steps), 100);
      });
    }, intervalTime);

    const messageTimer = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % MESSAGES.length);
    }, totalTime / MESSAGES.length);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center py-32 animate-fadeIn select-none">
      <LoadingSpinner 
        progress={progress}
        message={MESSAGES[messageIdx]}
        subMessage={progress < 100 ? "This usually takes about 20 seconds." : "Almost there! Still working..."}
        size="lg"
      />
    </div>
  );
};
