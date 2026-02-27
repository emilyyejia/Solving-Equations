
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionModal from ../components/InstructionModal';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const DividingPercentTwiceLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskIndex, setTaskIndex] = useState(() => partialProgress?.taskIndex || 0);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const totalTasks = 4; // Placeholder count
  const isCompletedRef = useRef(false);

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ taskIndex, errorCount });
      }
    };
  }, [onSavePartialProgress, taskIndex, errorCount]);

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      setTaskIndex(prev => prev + 1);
    } else {
      setIsLevelComplete(true);
    }
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-white relative font-sans">
      {/* Instruction UI */}
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Level Instructions"
      >
        <p>Instructions for this level go here.</p>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={3}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(3); }}
        />
      )}

      {/* Progress Dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalTasks }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              index <= taskIndex ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-sky-300 text-center animate-fade-in">Task {taskIndex + 1} placeholder</h2>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
         <button
          onClick={handleNext}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          {taskIndex < totalTasks - 1 ? 'Next' : 'Finish'}
        </button>
         <button
          onClick={onExit}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Back to Map
        </button>
      </div>
    </div>
  );
};

export default DividingPercentTwiceLevel1;
