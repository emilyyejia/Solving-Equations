
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';
import InstructionModal from '../components/InstructionModal';

interface EquationProblem {
  id: number;
  equation: string;
  correctX: number;
  answers: { v1: string; v2: string; v3: string; v4: string; v5: string; v6: string; }
}

const PROBLEMS: EquationProblem[] = [
  { id: 1, equation: "4x + 1 = 21", correctX: 5, answers: { v1: "5", v2: "20", v3: "21", v4: "", v5: "21", v6: "21" } },
  { id: 2, equation: "5x + 4 = 3x + 16", correctX: 6, answers: { v1: "6", v2: "6", v3: "30", v4: "18", v5: "34", v6: "34" } }
];

const UnlockVariableLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [problemIndex, setProblemIndex] = useState(() => partialProgress?.problemIndex || 0);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [userX, setUserX] = useState(() => partialProgress?.userX || '');
  const [verifyInputs, setVerifyInputs] = useState(() => partialProgress?.verifyInputs || { v1: '', v2: '', v3: '', v4: '', v5: '', v6: '' });
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [errorFlash, setErrorFlash] = useState(false);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ problemIndex, errorCount, userX, verifyInputs });
      }
    };
  }, [onSavePartialProgress, problemIndex, errorCount, userX, verifyInputs]);

  const handleCheck = () => {
    const p = PROBLEMS[problemIndex];
    const newErrors = new Set<string>();

    if (parseInt(userX) !== p.correctX) newErrors.add('x');
    
    if (problemIndex === 0) {
      if (verifyInputs.v1 !== "5") newErrors.add('v1');
      if (verifyInputs.v2 !== "20") newErrors.add('v2');
      if (verifyInputs.v3 !== "21") newErrors.add('v3');
      if (verifyInputs.v5 !== "21") newErrors.add('v5');
      if (verifyInputs.v6 !== "21") newErrors.add('v6');
    } else {
      if (verifyInputs.v1 !== "6") newErrors.add('v1');
      if (verifyInputs.v2 !== "6") newErrors.add('v2');
      if (verifyInputs.v3 !== "30") newErrors.add('v3');
      if (verifyInputs.v4 !== "18") newErrors.add('v4');
      if (verifyInputs.v5 !== "34") newErrors.add('v5');
      if (verifyInputs.v6 !== "34") newErrors.add('v6');
    }

    setFieldErrors(newErrors);

    if (newErrors.size === 0) {
      if (problemIndex < PROBLEMS.length - 1) {
        setProblemIndex(prev => prev + 1); 
        setUserX(''); 
        setVerifyInputs({ v1: '', v2: '', v3: '', v4: '', v5: '', v6: '' });
        setFieldErrors(new Set());
      } else {
        setIsLevelComplete(true);
      }
    } else {
      setErrorCount(prev => prev + 1); 
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 500);
    }
  };

  const getStars = () => { if (errorCount === 0) return 3; if (errorCount <= 2) return 2; return 1; };

  const handleReplay = () => {
    setProblemIndex(0); setErrorCount(0); setUserX(''); 
    setVerifyInputs({ v1: '', v2: '', v3: '', v4: '', v5: '', v6: '' }); 
    setFieldErrors(new Set());
    setIsLevelComplete(false);
  };

  const p = PROBLEMS[problemIndex];

  return (
    <div className="flex flex-col items-center min-h-full p-4 text-white bg-gray-900 font-sans pb-20 relative">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots 
          currentStep={problemIndex + 1} 
          totalSteps={PROBLEMS.length}
        />
      </div>
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Mastery Challenge">
        <p>Solve the following equations. You can use any methods: guessing, table of values, balancing model, inverse operations.</p>
        <p className="text-sm mt-2 text-gray-400 italic font-bold">Incorrect or incomplete boxes will be outlined in red after you click check.</p>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={getStars()}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(getStars()); }}
        />
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 mt-8">
        <div className="text-5xl font-mono mb-10 font-bold bg-gray-900/50 px-8 py-6 rounded-3xl border border-gray-700 text-center text-white">
           {p.equation}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700">
             <h3 className="text-sky-300 font-bold mb-4 uppercase text-lg">Step 1: Solve for x</h3>
             <div className="flex items-center justify-center gap-4 text-4xl">
               <span className="font-mono text-white">x = </span>
               <input 
                 type="number" 
                 value={userX} 
                 onChange={e => {
                    setUserX(e.target.value);
                    if (fieldErrors.has('x')) {
                        const n = new Set(fieldErrors); n.delete('x'); setFieldErrors(n);
                    }
                 }}
                 className={`w-24 bg-gray-800 border-4 rounded-xl p-3 text-center text-white outline-none transition-all ${fieldErrors.has('x') ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-sky-500'} ${errorFlash && fieldErrors.has('x') ? 'animate-shake' : ''}`}
               />
             </div>
          </div>

          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-700">
             <h3 className="text-emerald-400 font-bold mb-4 uppercase text-lg">Step 2: Verify Solution</h3>
             <div className="space-y-4 font-mono text-xl text-white">
               {problemIndex === 0 ? (
                 <>
                   <div className="flex items-center gap-1">
                     <span className="text-white">4(</span>
                     <input type="text" className={`w-10 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v1') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v1} onChange={e => { setVerifyInputs({...verifyInputs, v1: e.target.value}); if (fieldErrors.has('v1')) { const n = new Set(fieldErrors); n.delete('v1'); setFieldErrors(n); }}} />
                     <span className="text-white">) + 1 = 21</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <input type="text" className={`w-12 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v2') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v2} onChange={e => { setVerifyInputs({...verifyInputs, v2: e.target.value}); if (fieldErrors.has('v2')) { const n = new Set(fieldErrors); n.delete('v2'); setFieldErrors(n); }}} />
                     <span className="text-white"> + 1 = </span>
                     <input type="text" className={`w-12 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v3') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v3} onChange={e => { setVerifyInputs({...verifyInputs, v3: e.target.value}); if (fieldErrors.has('v3')) { const n = new Set(fieldErrors); n.delete('v3'); setFieldErrors(n); }}} />
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-1">
                     <span className="text-white">5(</span>
                     <input type="text" className={`w-10 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v1') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v1} onChange={e => { setVerifyInputs({...verifyInputs, v1: e.target.value}); if (fieldErrors.has('v1')) { const n = new Set(fieldErrors); n.delete('v1'); setFieldErrors(n); }}} />
                     <span className="text-white">)+4 = 3(</span>
                     <input type="text" className={`w-10 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v2') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v2} onChange={e => { setVerifyInputs({...verifyInputs, v2: e.target.value}); if (fieldErrors.has('v2')) { const n = new Set(fieldErrors); n.delete('v2'); setFieldErrors(n); }}} />
                     <span className="text-white">)+16</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <input type="text" className={`w-10 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v3') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v3} onChange={e => { setVerifyInputs({...verifyInputs, v3: e.target.value}); if (fieldErrors.has('v3')) { const n = new Set(fieldErrors); n.delete('v3'); setFieldErrors(n); }}} />
                     <span className="text-white">+4 = </span>
                     <input type="text" className={`w-10 bg-gray-800 border-b-2 text-center text-white transition-colors ${fieldErrors.has('v4') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v4} onChange={e => { setVerifyInputs({...verifyInputs, v4: e.target.value}); if (fieldErrors.has('v4')) { const n = new Set(fieldErrors); n.delete('v4'); setFieldErrors(n); }}} />
                     <span className="text-white">+16</span>
                   </div>
                 </>
               )}
               <div className="flex items-center justify-center gap-4 text-emerald-400 pt-4 font-bold text-2xl">
                 <input type="text" className={`w-16 bg-gray-800 border-4 rounded text-center text-white transition-colors ${fieldErrors.has('v5') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v5} onChange={e => { setVerifyInputs({...verifyInputs, v5: e.target.value}); if (fieldErrors.has('v5')) { const n = new Set(fieldErrors); n.delete('v5'); setFieldErrors(n); }}} />
                 <span className="text-white">=</span>
                 <input type="text" className={`w-16 bg-gray-800 border-4 rounded text-center text-white transition-colors ${fieldErrors.has('v6') ? 'border-red-600 text-red-400' : 'border-emerald-500'}`} value={verifyInputs.v6} onChange={e => { setVerifyInputs({...verifyInputs, v6: e.target.value}); if (fieldErrors.has('v6')) { const n = new Set(fieldErrors); n.delete('v6'); setFieldErrors(n); }}} />
               </div>
             </div>
          </div>
        </div>

        <button 
          onClick={handleCheck}
          className="mt-12 w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-2xl font-bold text-2xl shadow-lg transition-all active:scale-95"
        >
          {problemIndex < PROBLEMS.length - 1 ? 'Check & Next' : 'Verify and Finish'}
        </button>
      </div>
    </div>
  );
};

export default UnlockVariableLevel3;
