
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionModal from '../components/InstructionModal';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

type SortItem = {
  id: string;
  display: string;
  category: string;
};

const PHASE1_ITEMS: SortItem[] = [
  { id: 'p1-1', display: 'x + 3', category: 'Binomials' },
  { id: 'p1-2', display: '2x³y', category: 'Monomials' },
  { id: 'p1-3', display: 'x²', category: 'Monomials' },
  { id: 'p1-4', display: '4x - y', category: 'Binomials' },
  { id: 'p1-5', display: '3ab', category: 'Monomials' },
  { id: 'p1-6', display: '(x³)²', category: 'Monomials' },
];

const PHASE2_ITEMS: SortItem[] = [
  { id: 'p2-1', display: '7x', category: 'Degree 1' },
  { id: 'p2-2', display: '3x²', category: 'Degree 2' },
  { id: 'p2-3', display: 'x³', category: 'Degree 3+' },
  { id: 'p2-4', display: '-5x²', category: 'Degree 2' },
  { id: 'p2-5', display: '2x³', category: 'Degree 3+' },
  { id: 'p2-6', display: 'xy', category: 'Degree 2' },
  { id: 'p2-7', display: '(a²)²', category: 'Degree 3+' },
  { id: 'p2-8', display: 'b', category: 'Degree 1' },
  { id: 'p2-9', display: '-3m²n', category: 'Degree 3+' },
];

const PolynomialsLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<1 | 2>(() => partialProgress?.phase || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ phase, errorCount });
      }
    };
  }, [onSavePartialProgress, phase, errorCount]);

  const items = phase === 1 ? PHASE1_ITEMS : PHASE2_ITEMS;
  const categories = phase === 1 ? ['Monomials', 'Binomials'] : ['Degree 1', 'Degree 2', 'Degree 3+'];

  const handleItemClick = (id: string) => {
    if (feedback[id] === 'correct') return;
    setSelectedItemId(id);
  };

  const handleBinClick = (category: string) => {
    if (!selectedItemId) return;
    setAssignments(prev => ({ ...prev, [selectedItemId]: category }));
    setSelectedItemId(null);
  };

  const handleCheck = () => {
    const newFeedback: Record<string, 'correct' | 'incorrect'> = {};
    let allCorrect = true;

    items.forEach(item => {
      if (assignments[item.id] === item.category) {
        newFeedback[item.id] = 'correct';
      } else {
        newFeedback[item.id] = 'incorrect';
        allCorrect = false;
      }
    });

    setFeedback(newFeedback);

    if (!allCorrect) {
      setErrorCount(prev => prev + 1);
    }

    if (allCorrect) {
      setTimeout(() => {
        if (phase === 1) {
          setPhase(2);
          setAssignments({});
          setFeedback({});
        } else {
          setIsLevelComplete(true);
        }
      }, 2000);
    }
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    window.location.reload();
  };

  const isEveryItemAssigned = items.every(i => !!assignments[i.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-6xl mx-auto">
      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount <= 2 ? 2 : 1}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : errorCount <= 2 ? 2 : 1); }}
        />
      )}

      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title={phase === 1 ? "Phase 1: Polynomial Types" : "Phase 2: Degree Sort"}
      >
        {phase === 1 ? (
          <div className="space-y-4">
            <p><strong>A polynomial</strong> is an algebraic expression with 1 or more terms.</p>
            <p><strong>A monomial</strong> is one number, one variable, or a number multiplied by variables. NO addition or subtraction. It is only one term.</p>
            <p><strong>A binomial</strong> has 2 terms, separated by a + or - sign.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>The <strong>degree of a term</strong> is the total when you add the exponents on the variables.</p>
            <p>Examples:</p>
            <ul className="list-disc pl-5">
              <li>x has degree 1</li>
              <li>x² has degree 2</li>
              <li>xy has degree 2 (1 + 1)</li>
              <li>x²y has degree 3 (2 + 1)</li>
            </ul>
          </div>
        )}
      </InstructionModal>

      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-sky-400">Level 1: Polynomials and Degrees</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full items-start">
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 min-h-[300px]">
          <h3 className="text-center text-gray-400 font-bold uppercase tracking-wider mb-4">Expressions</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {items.map(item => {
              const isAssigned = !!assignments[item.id] && feedback[item.id] !== 'incorrect';
              if (isAssigned) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`px-6 py-3 rounded-xl font-mono text-2xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                    selectedItemId === item.id 
                      ? 'bg-indigo-600 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                      : feedback[item.id] === 'incorrect'
                        ? 'bg-rose-900 border-rose-500 animate-shake'
                        : 'bg-gray-700 border-gray-600 hover:border-sky-500'
                  }`}
                >
                  {item.display}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => (
            <div 
              key={cat}
              onClick={() => handleBinClick(cat)}
              className={`p-6 rounded-2xl border-2 border-dashed transition-colors flex flex-col min-h-[180px] cursor-pointer ${
                selectedItemId ? 'bg-sky-500/10 border-sky-400/50 hover:bg-sky-500/20' : 'bg-gray-800 border-gray-700'
              }`}
            >
              <h4 className="text-lg font-bold text-sky-300 mb-4">{cat}</h4>
              <div className="flex flex-wrap gap-2">
                {items.filter(i => assignments[i.id] === cat).map(item => (
                  <div 
                    key={item.id} 
                    className={`px-3 py-1 rounded-lg font-mono text-lg border ${
                      feedback[item.id] === 'correct' ? 'bg-emerald-600 border-emerald-400' :
                      feedback[item.id] === 'incorrect' ? 'bg-rose-600 border-rose-400 animate-shake' :
                      'bg-indigo-900 border-indigo-700'
                    }`}
                  >
                    {item.display}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        {phase === 2 && <p className="text-sky-300 text-xl font-bold">Write a simplified expression.</p>}
        <button
          onClick={handleCheck}
          disabled={!isEveryItemAssigned}
          className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          {phase === 2 ? "Check Expression" : "Check Answers"}
        </button>
      </div>
    </div>
  );
};

export default PolynomialsLevel1;
