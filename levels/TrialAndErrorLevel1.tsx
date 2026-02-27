

import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const TrialAndErrorLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(() => partialProgress?.phase || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showVerifyHint, setShowVerifyHint] = useState(false);
  const isCompletedRef = useRef(false);

  // Randomized Equation States
  const [p1Config] = useState(() => partialProgress?.p1Config || { a: Math.floor(Math.random() * 8) + 2, target: Math.floor(Math.random() * 10) + 5 });
  const [p2Config] = useState(() => partialProgress?.p2Config || { coeff: Math.floor(Math.random() * 4) + 2, target: (Math.floor(Math.random() * 6) + 3) * (Math.floor(Math.random() * 3) + 2) });
  
  const p1X_correct = p1Config.target - p1Config.a;
  const p2X_correct = Math.floor(p2Config.target / p2Config.coeff);

  // State Persistence
  const [p1X, setP1X] = useState(() => partialProgress?.p1X || 0);
  const [p2X, setP2X] = useState(() => partialProgress?.p2X || 0);
  const [p3Table, setP3Table] = useState(() => partialProgress?.p3Table || {
    [-1]: { left: '', right: '' },
    [0]: { left: '', right: '' },
    [1]: { left: '', right: '' },
    [2]: { left: '', right: '' },
  });
  const [p3FinalX, setP3FinalX] = useState(() => partialProgress?.p3FinalX || '');
  const [p3Verify, setP3Verify] = useState(() => partialProgress?.p3Verify || { v1: '', v2: '', v3: '', v4: '', v5: '', v6: '' });
  const [p3ShowVerify, setP3ShowVerify] = useState(() => partialProgress?.p3ShowVerify || false);
  
  const [tableErrors, setTableErrors] = useState<Set<string>>(new Set());
  const [verifyErrors, setVerifyErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ phase, errorCount, p1X, p2X, p3Table, p3FinalX, p3Verify, p3ShowVerify, p1Config, p2Config });
      }
    };
  }, [onSavePartialProgress, phase, errorCount, p1X, p2X, p3Table, p3FinalX, p3Verify, p3ShowVerify, p1Config, p2Config]);

  const recordError = (id: string, group: 'table' | 'verify') => {
    setErrorCount(prev => prev + 1);
    if (group === 'table') setTableErrors(prev => new Set(prev).add(id));
    else setVerifyErrors(prev => new Set(prev).add(id));
    setTimeout(() => {
      if (group === 'table') setTableErrors(prev => { const n = new Set(prev); n.delete(id); return n; });
      else setVerifyErrors(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 2000);
  };

  const handleP3CheckTable = () => {
    // Standard P3 equation: 3x + 2 = x + 4. Solution x = 1.
    const expected = {
      [-1]: { l: '-1', r: '3' },
      [0]: { l: '2', r: '4' },
      [1]: { l: '5', r: '5' },
      [2]: { l: '8', r: '6' }
    };
    
    let hasError = false;
    Object.entries(expected).forEach(([x, vals]) => {
      const xInt = parseInt(x);
      if (p3Table[xInt].left !== vals.l) { recordError(`table-${x}-l`, 'table'); hasError = true; }
      if (p3Table[xInt].right !== vals.r) { recordError(`table-${x}-r`, 'table'); hasError = true; }
    });

    if (p3FinalX !== '1') { recordError('final-x', 'table'); hasError = true; }
    if (!hasError) setP3ShowVerify(true);
  };

  const handleP3CheckFinal = () => {
    const answers = { v1: '1', v2: '1', v3: '3', v4: '1', v5: '5', v6: '5' };
    let hasError = false;
    Object.entries(answers).forEach(([key, val]) => {
      if (p3Verify[key as keyof typeof p3Verify] !== val) {
        recordError(key, 'verify');
        hasError = true;
      }
    });

    if (!hasError) setIsLevelComplete(true);
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    window.location.reload(); // Simplest way to re-randomize
  };

  return (
    <div className="flex flex-col items-center min-h-full p-4 text-white bg-gray-900 font-sans max-w-5xl mx-auto pb-20 relative">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={phase} totalSteps={3} onStepClick={(s) => setPhase(s as 1|2|3)} />
      </div>
      
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Discovery Logic">
        <p>Testing values is a great way to start solving! If you put a number in for 'x' and both sides of the '=' are the same, you've found the solution.</p>
        <div className="mt-4 p-4 bg-sky-900/30 rounded-lg border border-sky-500/30">
            <p className="text-sky-300 font-bold mb-1">Example Hint:</p>
            <p className="italic">"If you have y + 10 = 15, try testing 5. Does 5 + 10 = 15? Yes! So y = 5."</p>
        </div>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount <= 3 ? 2 : 1}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : 2); }}
          hintMessage="Try to get the right answer on your first guess for all three bars!"
        />
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 mt-8">
        {phase === 1 && (
          <div className="animate-fade-in text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-sky-400 mb-6 uppercase tracking-widest">Bar 1: Testing a Guess</h2>
            <p className="text-gray-100 mb-10 text-4xl font-bold">Find x in <span className="text-indigo-300">x + {p1Config.a} = {p1Config.target}</span></p>
            <div className="flex items-center gap-6 mb-12">
              <div className="flex flex-col items-center">
                <button onClick={() => setP1X(v => v + 1)} className="p-2 hover:text-sky-400"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center text-6xl font-mono border-2 border-gray-700 shadow-inner">{p1X}</div>
                <button onClick={() => setP1X(v => v - 1)} className="p-2 hover:text-sky-400"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
              </div>
              <div className="text-5xl font-mono text-white">+ {p1Config.a} = {p1Config.target}</div>
            </div>
            {p1X === p1X_correct ? (
              <button onClick={() => setPhase(2)} className="bg-sky-600 hover:bg-sky-500 text-white px-12 py-4 rounded-xl font-bold text-2xl animate-fade-in-up shadow-lg border-b-4 border-sky-800">Check & Next &rarr;</button>
            ) : (
                <div className="text-gray-500 italic">"If you had y + 2 = 5, you'd test 3 because 3 + 2 = 5."</div>
            )}
          </div>
        )}

        {phase === 2 && (
          <div className="animate-fade-in text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-sky-400 mb-6 uppercase tracking-widest">Bar 2: Multiplication Mystery</h2>
            <p className="text-gray-100 mb-10 text-4xl font-bold">Find x in <span className="text-indigo-300">{p2Config.coeff}x = {p2Config.target}</span></p>
            <div className="flex justify-center items-center gap-4 mb-12">
               <div className="text-6xl font-mono text-white">{p2Config.coeff} [</div>
               <div className="flex flex-col items-center">
                  <button onClick={() => setP2X(v => v + 1)} className="p-1 hover:text-sky-400"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                  <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center text-6xl font-mono border-4 border-sky-500/50 text-sky-300 shadow-lg">{p2X}</div>
                  <button onClick={() => setP2X(v => v - 1)} className="p-1 hover:text-sky-400"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
               </div>
               <div className="text-6xl font-mono text-white">] = {p2Config.target}</div>
            </div>
            {p2X === p2X_correct ? (
              <button onClick={() => setPhase(3)} className="bg-sky-600 hover:bg-sky-500 text-white px-12 py-4 rounded-xl font-bold text-2xl animate-fade-in-up shadow-lg border-b-4 border-sky-800">Check & Next &rarr;</button>
            ) : (
                <div className="text-gray-500 italic">"Think of 5z = 25. You know 5 times 5 is 25, so z must be 5!"</div>
            )}
          </div>
        )}

        {phase === 3 && (
          <div className="animate-fade-in flex flex-col items-center">
            <h2 className="text-xl font-bold text-sky-400 mb-2 uppercase tracking-widest text-center w-full">Bar 3: Side-by-Side Comparison</h2>
            <div className="text-4xl font-mono mb-6 font-bold bg-gray-900/50 px-8 py-4 rounded-3xl border border-gray-700 text-white">
               <span className="text-emerald-400">3x + 2</span> = <span className="text-orange-400">x + 4</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
              <div>
                <table className="w-full text-center border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-400 uppercase text-xs font-black tracking-widest">
                      <th className="pb-4">x</th>
                      <th className="pb-4 text-emerald-400">Left Side</th>
                      <th className="pb-4 text-orange-400">Right Side</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {[-1, 0, 1, 2].map(x => (
                      <tr key={x}>
                        <td className="py-2 text-2xl font-bold text-gray-400">{x}</td>
                        <td>
                          <input type="text" className={`w-16 bg-gray-900 text-white p-2 rounded-lg text-center text-xl border-2 transition-all outline-none ${tableErrors.has(`table-${x}-l`) ? 'border-red-500 animate-shake' : 'border-gray-700 focus:border-emerald-500'}`} value={p3Table[x].left} onChange={e => setP3Table({...p3Table, [x]: {...p3Table[x], left: e.target.value}})} />
                        </td>
                        <td>
                          <input type="text" className={`w-16 bg-gray-900 text-white p-2 rounded-lg text-center text-xl border-2 transition-all outline-none ${tableErrors.has(`table-${x}-r`) ? 'border-red-500 animate-shake' : 'border-gray-700 focus:border-orange-500'}`} value={p3Table[x].right} onChange={e => setP3Table({...p3Table, [x]: {...p3Table[x], right: e.target.value}})} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-8 flex flex-col items-center gap-4 text-xl bg-sky-900/20 p-4 rounded-2xl border border-sky-500/20 shadow-inner">
                  <span className="font-bold text-white text-center">The pans are equal when x is ______</span>
                  <input type="text" className={`w-20 bg-gray-900 text-white border-2 rounded-xl p-3 text-center font-bold text-3xl outline-none ${tableErrors.has('final-x') ? 'border-red-500 animate-shake' : 'border-sky-500'}`} value={p3FinalX} onChange={e => setP3FinalX(e.target.value)} />
                  {!p3ShowVerify && <button onClick={handleP3CheckTable} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl shadow-lg border-b-4 border-sky-800">Check</button>}
                </div>
              </div>
              {p3ShowVerify && (
                <div className="animate-fade-in-up space-y-6 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-emerald-400 font-black text-xl uppercase tracking-widest">Verify Solution</h3>
                    <button onClick={() => setShowVerifyHint(!showVerifyHint)} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded-full transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </button>
                    {showVerifyHint && (
                        <div className="absolute top-12 right-0 w-64 bg-slate-800 border-2 border-yellow-500 p-4 rounded-xl shadow-2xl text-sm z-50 animate-fade-in-up font-bold">
                            "If you found k = 10 for 2k = 20, you verify by checking if 2(10) is really 20."
                        </div>
                    )}
                  </div>
                  <div className="space-y-6 text-2xl font-mono text-white bg-gray-900/40 p-6 rounded-2xl border border-gray-700">
                    <div className="flex items-center gap-1">
                      <span>3(</span>
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-12 bg-gray-900 text-white border-b-2 text-center rounded ${verifyErrors.has('v1') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p3Verify.v1} onChange={e => setP3Verify({...p3Verify, v1: e.target.value})} />
                      <span>) + 2 = (</span>
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-12 bg-gray-900 text-white border-b-2 text-center rounded ${verifyErrors.has('v2') ? 'border-red-500 animate-shake' : 'border-orange-500'}`} value={p3Verify.v2} onChange={e => setP3Verify({...p3Verify, v2: e.target.value})} />
                      <span>) + 4</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-14 bg-gray-900 text-white border-b-2 text-center rounded ${verifyErrors.has('v3') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p3Verify.v3} onChange={e => setP3Verify({...p3Verify, v3: e.target.value})} />
                      <span>+ 2 = </span>
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-14 bg-gray-900 text-white border-b-2 text-center rounded ${verifyErrors.has('v4') ? 'border-red-500 animate-shake' : 'border-orange-500'}`} value={p3Verify.v4} onChange={e => setP3Verify({...p3Verify, v4: e.target.value})} />
                      <span>+ 4</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-emerald-400 pt-4 border-t border-gray-700">
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-16 bg-gray-900 border-2 rounded text-center ${verifyErrors.has('v5') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p3Verify.v5} onChange={e => setP3Verify({...p3Verify, v5: e.target.value})} />
                      <span className="text-white">=</span>
                      {/* FIX: Corrected state variable and setter names (changed p2Verify to p3Verify and setP2Verify to setP3Verify) */}
                      <input type="text" className={`w-16 bg-gray-900 border-2 rounded text-center ${verifyErrors.has('v6') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p3Verify.v6} onChange={e => setP3Verify({...p3Verify, v6: e.target.value})} />
                    </div>
                    <button onClick={handleP3CheckFinal} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 border-b-4 border-emerald-800">Check</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialAndErrorLevel1;
