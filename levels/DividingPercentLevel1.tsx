
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const DividingPercentLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskIndex, setTaskIndex] = useState(() => partialProgress?.taskIndex || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const totalTasks = 4;
  const isCompletedRef = useRef(false);

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ taskIndex });
      }
    };
  }, [onSavePartialProgress, taskIndex]);

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      setTaskIndex(prev => prev + 1);
    } else {
      setIsLevelComplete(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-white relative font-sans">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={taskIndex + 1} totalSteps={totalTasks} onStepClick={(s) => setTaskIndex(s - 1)} />
      </div>

      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Percentage Basics"
      >
        <p>Understanding how to divide percentages helps in splitting things up fairly!</p>
        <div className="mt-4 p-4 bg-sky-900/30 rounded-lg border border-sky-500/30">
            <p className="text-sky-300 font-bold mb-1">Concept Hint:</p>
            <p className="italic">"If you have a full 100% of a pizza and split it between 4 people, each gets 25% (100 / 4)."</p>
        </div>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={3}
          onReplay={() => { onSavePartialProgress?.(null); window.location.reload(); }}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(3); }}
          hintMessage="Try to visualize the whole and its parts!"
        />
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-12 text-center border border-gray-700 shadow-2xl">
        <h2 className="text-4xl font-bold mb-8 text-sky-300 animate-fade-in uppercase tracking-tight">Task {taskIndex + 1}: Breaking Down the Whole</h2>
        <div className="bg-gray-900/50 p-10 rounded-2xl mb-10 text-gray-400 text-xl border border-gray-700 italic">
           [Visual Activity Placeholder: Identifying parts of 100%]
        </div>
        <div className="flex gap-6 justify-center">
            <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-12 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest border-b-4 border-emerald-800"
            >
                {taskIndex < totalTasks - 1 ? 'Check & Next' : 'Verify & Finish'}
            </button>
            <button
                onClick={onExit}
                className="bg-gray-700 hover:bg-gray-600 text-white font-black py-4 px-10 rounded-xl shadow-lg transition-all border border-gray-600 active:scale-95 uppercase tracking-widest"
            >
                Back to Map
            </button>
        </div>
      </div>
    </div>
  );
};

export default DividingPercentLevel1;
