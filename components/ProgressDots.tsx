
import React from 'react';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div className="flex gap-3 justify-center items-center p-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCurrent = stepNum === currentStep;
        const isPast = stepNum < currentStep;

        return (
          <button
            key={i}
            onClick={() => onStepClick && onStepClick(stepNum)}
            disabled={!onStepClick}
            title={`Jump to Step ${stepNum}`}
            className={`w-4 h-4 rounded-full transition-all duration-300 relative group flex items-center justify-center
              ${onStepClick ? 'cursor-pointer hover:scale-150 active:scale-90' : 'cursor-not-allowed'}
              ${isCurrent 
                ? 'bg-sky-400 ring-2 ring-sky-300/50 shadow-[0_0_12px_rgba(56,189,248,0.8)] z-10' 
                : isPast 
                  ? 'bg-emerald-500 hover:bg-emerald-400' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }
            `}
          >
            {/* Larger hidden hit area for better accessibility */}
            <div className="absolute -inset-2 rounded-full" />
            
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none z-50 border border-gray-600">
              {isCurrent ? 'You are here' : `Jump to Step ${stepNum}`}
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-gray-600" />
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ProgressDots;
