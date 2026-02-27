
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const ShapesEquationsLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<1 | 2 | 3>(() => partialProgress?.step || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const isCompletedRef = useRef(false);

  // Randomized configurations for the 3 puzzles
  const [p1Config] = useState(() => partialProgress?.p1Config || (() => {
    const xCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const sol = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const constWeight = Math.floor(Math.random() * 6) + 4; // 4 to 9
    const total = xCount * sol + constWeight;
    return { xCount, constWeight, total, sol };
  })());
  
  const [p2Config] = useState(() => partialProgress?.p2Config || (() => {
    const k = Math.floor(Math.random() * 5) + 3; // side A is x + k
    const sol = Math.floor(Math.random() * 4) + 4; // x = 4 to 7
    const total = 4 * sol + 2 * k; // Perimeter = 2(x + x + k)
    return { k, total, sol };
  })());

  const [p3Config] = useState(() => partialProgress?.p3Config || (() => {
    const sol = Math.floor(Math.random() * 6) + 5; // x = 5 to 10
    const total = 4 * sol; // Perimeter of square
    return { total, sol };
  })());

  // Puzzle 1 states
  const [s1Eq, setS1Eq] = useState(() => partialProgress?.s1Eq || '');
  const [s1X, setS1X] = useState(() => partialProgress?.s1X || '');
  const [s1ShowX, setS1ShowX] = useState(() => partialProgress?.s1ShowX || false);
  
  // Puzzle 2 states
  const [s2Eq, setS2Eq] = useState(() => partialProgress?.s2Eq || '');
  const [s2X, setS2X] = useState(() => partialProgress?.s2X || '');
  const [s2ShowX, setS2ShowX] = useState(() => partialProgress?.s2ShowX || false);
  
  // Puzzle 3 states
  const [s3Eq, setS3Eq] = useState(() => partialProgress?.s3Eq || '');
  const [s3X, setS3X] = useState(() => partialProgress?.s3X || '');
  const [s3ShowX, setS3ShowX] = useState(() => partialProgress?.s3ShowX || false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ 
            step, errorCount, 
            s1Eq, s1X, s1ShowX, 
            s2Eq, s2X, s2ShowX, 
            s3Eq, s3X, s3ShowX, 
            p1Config, p2Config, p3Config 
        });
      }
    };
  }, [onSavePartialProgress, step, errorCount, s1Eq, s1X, s1ShowX, s2Eq, s2X, s2ShowX, s3Eq, s3X, s3ShowX, p1Config, p2Config, p3Config]);

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    setFeedback({ message: msg, type });
    if (type === 'error') {
      setErrorCount(prev => prev + 1);
    }
  };

  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();

  const handleStep1 = () => {
    setFeedback(null);
    if (!s1ShowX) {
      const target = `${p1Config.xCount}x+${p1Config.constWeight}=${p1Config.total}`;
      const targetAlt = `${p1Config.constWeight}+${p1Config.xCount}x=${p1Config.total}`;
      const input = normalize(s1Eq);
      if (input === target || input === targetAlt) {
        showFeedback("Correct Equation! Now solve for x.", 'success');
        setS1ShowX(true);
      } else {
        showFeedback("Not quite — count the X boxes and the number tile. Almost there! What equation shows what you have on the left equals the total?", 'error');
      }
    } else {
      if (parseInt(s1X) === p1Config.sol) {
        showFeedback("Well done!", 'success');
        setTimeout(() => { setStep(2); setFeedback(null); }, 1000);
      } else {
        showFeedback("Not quite — remove the extra weight first. Almost there! What should you do after subtracting to find one X?", 'error');
      }
    }
  };

  const handleStep2 = () => {
    setFeedback(null);
    if (!s2ShowX) {
      const target = `4x+${2 * p2Config.k}=${p2Config.total}`;
      if (normalize(s2Eq) === target) {
        showFeedback("Expression correct! Now find x.", 'success');
        setS2ShowX(true);
      } else {
        showFeedback(`Not quite — add all 4 sides together. Almost there! What is x + y + x + y when y = x + ${p2Config.k}?`, 'error');
      }
    } else {
      if (parseInt(s2X) === p2Config.sol) {
        showFeedback("Correct!", 'success');
        setTimeout(() => { setStep(3); setFeedback(null); }, 1000);
      } else {
        showFeedback("Not quite — subtract the constant first. Almost there! What should you divide by to find x?", 'error');
      }
    }
  };

  const handleStep3 = () => {
    setFeedback(null);
    if (!s3ShowX) {
      const target = `4x=${p3Config.total}`;
      if (normalize(s3Eq) === target || normalize(s3Eq) === `${p3Config.total}=4x`) {
        showFeedback("Perfect! Now find the value of one side.", 'success');
        setS3ShowX(true);
      } else {
        showFeedback("Not quite — all 4 sides are equal. Almost there! What equation shows 4 equal sides adding up to the perimeter?", 'error');
      }
    } else {
      if (parseInt(s3X) === p3Config.sol) {
        setFeedback(null);
        setIsLevelComplete(true);
      } else {
        showFeedback("Not quite — check how multiplication is affecting x. Almost there! What should you do to undo '× 4'?", 'error');
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-5xl mx-auto pb-24 relative">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={step} totalSteps={3} />
      </div>
      
      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount <= 3 ? 2 : 1}
          onReplay={() => { onSavePartialProgress?.(null); window.location.reload(); }}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : errorCount <= 3 ? 2 : 1); }}
        />
      )}

      <div className="w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 mt-8">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="bg-gray-900/50 p-8 rounded-2xl mb-10 flex items-center justify-center gap-12 border-b-4 border-gray-700 shadow-inner">
               <div className="flex items-center gap-4">
                  {Array.from({ length: p1Config.xCount }).map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-sky-600 rounded flex items-center justify-center text-3xl font-bold text-white shadow-md">x</div>
                  ))}
                  <div className="w-14 h-14 bg-yellow-600 rotate-45 flex items-center justify-center text-xl font-bold text-white shadow-md"><span className="-rotate-45">{p1Config.constWeight}</span></div>
               </div>
               <div className="text-4xl font-bold text-gray-500">=</div>
               <div className="flex items-center gap-2">
                  <div className="bg-emerald-600 rounded-2xl px-6 py-4 font-bold text-4xl text-white shadow-md border-b-4 border-emerald-800">{p1Config.total}</div>
               </div>
            </div>
            <div className="space-y-6 w-full max-w-md">
                <p className="text-center text-gray-300 font-bold">Write the equation:</p>
                <input 
                    type="text" 
                    value={s1Eq} 
                    onChange={e => setS1Eq(e.target.value)} 
                    disabled={s1ShowX} 
                    className={`w-full bg-gray-900 border-2 p-4 rounded-xl text-center text-2xl font-mono text-white transition-all ${s1ShowX ? 'border-emerald-500' : 'border-sky-500 focus:ring-4 focus:ring-sky-400/30'}`} 
                    placeholder="e.g. 2x + ..." 
                />
                {!s1ShowX && <button onClick={handleStep1} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>}
                {s1ShowX && (
                  <div className="animate-fade-in-up space-y-6 pt-6 border-t border-gray-700 w-full">
                    <p className="text-center text-emerald-400 font-bold text-2xl">Find x:</p>
                    <div className="flex justify-center items-center gap-4 text-4xl"><span className="font-mono text-white">x = </span><input type="number" value={s1X} onChange={e => setS1X(e.target.value)} className="w-24 bg-gray-900 border-4 border-emerald-500 p-3 rounded-xl text-center text-white outline-none" /></div>
                    <button onClick={handleStep1} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>
                  </div>
                )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="relative w-96 h-64 bg-indigo-900/30 border-4 border-indigo-500 rounded-lg flex items-center justify-center mb-16 shadow-lg mt-8">
               <span className="absolute -top-12 font-mono text-2xl text-white">y</span>
               <span className="absolute -bottom-12 font-mono text-2xl text-white">y</span>
               <span className="absolute -left-14 font-mono text-2xl -rotate-90 text-white">x</span>
               <span className="absolute -right-14 font-mono text-2xl rotate-90 text-white">x</span>
               <p className="text-center font-bold text-indigo-200 text-xl">Perimeter = {p2Config.total}</p>
            </div>
            <div className="space-y-4 w-full max-w-md">
                <p className="text-yellow-400 font-bold text-xl text-center">Let y = x + {p2Config.k}</p>
                <p className="text-center text-gray-300 text-xl font-bold">Add all 4 sides to write the perimeter equation:</p>
                <input type="text" value={s2Eq} onChange={e => setS2Eq(e.target.value)} disabled={s2ShowX} className={`w-full bg-gray-900 border-2 p-4 rounded-xl text-center text-2xl font-mono text-white transition-all ${s2ShowX ? 'border-emerald-500' : 'border-sky-500 focus:ring-4 focus:ring-sky-400/30'}`} placeholder={`x + y + x + y = ${p2Config.total}`} />
                {!s2ShowX && <button onClick={handleStep2} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>}
                {s2ShowX && (
                  <div className="animate-fade-in-up space-y-6 pt-6 border-t border-gray-700 w-full">
                    <p className="text-center text-emerald-400 font-bold text-2xl">Find x:</p>
                    <div className="flex justify-center items-center gap-4 text-4xl"><span className="font-mono text-white">x = </span><input type="number" value={s2X} onChange={e => setS2X(e.target.value)} className="w-24 bg-gray-900 border-4 border-emerald-500 p-3 rounded-xl text-center text-white outline-none" /></div>
                    <button onClick={handleStep2} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>
                  </div>
                )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-48 h-48 bg-orange-900/30 border-4 border-orange-500 rounded-md flex items-center justify-center mb-10 relative shadow-lg">
               <span className="absolute -left-10 font-mono text-3xl text-white">x</span>
               <div className="flex flex-col items-center">
                 <p className="text-center font-bold text-orange-200 text-xl uppercase tracking-tighter">Perimeter</p>
                 <p className="text-6xl font-black text-white">{p3Config.total}</p>
               </div>
            </div>
            <div className="space-y-6 w-full max-w-md">
                <p className="text-center text-gray-300 text-xl font-bold">Write the equation:</p>
                <input type="text" value={s3Eq} onChange={e => setS3Eq(e.target.value)} disabled={s3ShowX} className={`w-full bg-gray-900 border-2 p-4 rounded-xl text-center text-2xl font-mono text-white transition-all ${s3ShowX ? 'border-emerald-500' : 'border-sky-500 focus:ring-4 focus:ring-sky-400/30'}`} placeholder="Sum of 4 sides..." />
                {!s3ShowX && <button onClick={handleStep3} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>}
                {s3ShowX && (
                  <div className="animate-fade-in-up space-y-6 pt-6 border-t border-gray-700 w-full">
                    <p className="text-center text-emerald-400 font-bold text-2xl">Solve for x:</p>
                    <div className="flex justify-center items-center gap-4 text-4xl"><span className="font-mono text-white">x = </span><input type="number" value={s3X} onChange={e => setS3X(e.target.value)} className="w-24 bg-gray-900 border-4 border-emerald-500 p-3 rounded-xl text-center text-white outline-none" /></div>
                    <button onClick={handleStep3} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-lg uppercase tracking-widest active:scale-95">Check</button>
                  </div>
                )}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`mt-8 p-4 rounded-xl text-center font-bold animate-fade-in transition-all border-2 shadow-xl ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-shake'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapesEquationsLevel1;
