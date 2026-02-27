
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const SolutionQuestLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<1 | 2 | 3>(() => partialProgress?.step || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const isCompletedRef = useRef(false);

  // States
  const [p1Eq, setP1Eq] = useState<string | null>(() => partialProgress?.p1Eq || null);
  const [p1Pen, setP1Pen] = useState(() => partialProgress?.p1Pen || '');
  const [p1Notebook, setP1Notebook] = useState(() => partialProgress?.p1Notebook || '');
  const [p1Phase, setP1Phase] = useState<'eq' | 'solve'>(() => partialProgress?.p1Phase || 'eq');
  const [p1Errors, setP1Errors] = useState<Set<string>>(new Set());
  const [p2Eq, setP2Eq] = useState<string | null>(() => partialProgress?.p2Eq || null);
  const [p2Students, setP2Students] = useState(() => partialProgress?.p2Students || '');
  const [p2Phase, setP2Phase] = useState<'eq' | 'solve'>(() => partialProgress?.p2Phase || 'eq');
  const [p3EqInput, setP3EqInput] = useState(() => partialProgress?.p3EqInput || '');
  const [p3Value, setP3Value] = useState(() => partialProgress?.p3Value || '');
  const [p3Phase, setP3Phase] = useState<'eq' | 'solve'>(() => partialProgress?.p3Phase || 'eq');

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step, errorCount, p1Eq, p1Pen, p1Notebook, p1Phase, p2Eq, p2Students, p2Phase, p3EqInput, p3Value, p3Phase });
      }
    };
  }, [onSavePartialProgress, step, errorCount, p1Eq, p1Pen, p1Notebook, p1Phase, p2Eq, p2Students, p2Phase, p3EqInput, p3Value, p3Phase]);

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    setFeedback({ message: msg, type });
    if (type === 'error') {
      setErrorCount(prev => prev + 1);
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleP1 = () => {
    if (p1Phase === 'eq') {
      if (p1Eq === 'A') { showFeedback("Correct equation! Now solve for the costs.", 'success'); setP1Phase('solve'); }
      else { showFeedback("Concept Hint: If a coffee costs $2 more than a donut (d), and together they cost $11, the equation is d + (d + 2) = 11.", 'error'); }
    } else {
      const newErrors = new Set<string>();
      if (p1Pen !== '5') newErrors.add('pen');
      if (p1Notebook !== '13') newErrors.add('notebook');
      if (newErrors.size === 0) { showFeedback("Excellent!", 'success'); setTimeout(() => { setStep(2); setFeedback(null); }, 1000); }
      else { setP1Errors(newErrors); showFeedback("Think: Combine the terms 1x and 2x to get 3x + 3 = 18.", 'error'); setTimeout(() => setP1Errors(new Set()), 2000); }
    }
  };

  const handleP2 = () => {
    if (p2Phase === 'eq') {
      if (p2Eq === 'C') { showFeedback("Spot on! Now find the number of students.", 'success'); setP2Phase('solve'); }
      else { showFeedback("Concept Hint: Total cost = (Price A × count A) + (Price B × count B). If you bought 5 shirts for $10 each and some hats for $5, it's 5(10) + 5h.", 'error'); }
    } else {
      if (p2Students === '3') { showFeedback("Correct!", 'success'); setTimeout(() => { setStep(2); setFeedback(null); }, 1000); }
      else { showFeedback("Think: 3 times 12 is 36. So 36 + 6x = 54. Subtract 36 from both sides first.", 'error'); }
    }
  };

  const handleP3 = () => {
    const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
    if (p3Phase === 'eq') {
      const normalizedInput = normalize(p3EqInput);
      if (normalizedInput === '3x-4=2x+5' || normalizedInput === '2x+5=3x-4') { showFeedback("Perfect translation!", 'success'); setP3Phase('solve'); }
      else { showFeedback("Concept Hint: '5 times a number increased by 2' is 5n + 2. '10 times a number decreased by 1' is 10n - 1.", 'error'); }
    } else {
      if (p3Value === '9') { setFeedback(null); setIsLevelComplete(true); }
      else { showFeedback("Think: 3x - 4 = 2x + 5. Subtract 2x from both sides, then add 4 to both sides.", 'error'); }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-5xl mx-auto pb-24 relative">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={step} totalSteps={3} onStepClick={(s) => setStep(s as 1|2|3)} />
      </div>
      
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Word Problem Guide">
        <p>Algebra is a language! Read sentences and translate them into numbers and symbols. Step 1: Write the equation. Step 2: Solve it!</p>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount <= 3 ? 2 : 1}
          onReplay={() => { onSavePartialProgress?.(null); window.location.reload(); }}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : 2); }}
          hintMessage="Careful reading leads to 3-star success!"
        />
      )}

      <div className="w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 mt-8">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center">
             <h2 className="text-xl font-bold text-sky-400 mb-6 uppercase tracking-widest text-center">Problem 1: Shopping Trip</h2>
             <div className="bg-gray-900/50 p-8 rounded-2xl mb-10 border-l-4 border-sky-500 relative">
                <p className="text-2xl leading-relaxed italic text-white">"A notebook costs <span className="text-yellow-400">$3 more than twice</span> the cost of a pen. Together, they cost <span className="text-emerald-400">$18</span>."</p>
                <button onClick={() => setActiveHint(activeHint === "h1" ? null : "h1")} className="absolute -top-4 -right-4 bg-yellow-500 text-slate-900 w-10 h-10 rounded-full font-black text-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110">?</button>
                {activeHint === "h1" && (
                    <div className="absolute top-12 right-0 w-72 bg-slate-800 border-2 border-yellow-500 p-4 rounded-xl shadow-2xl text-sm z-50 animate-fade-in-up font-bold">
                        "If a ticket is $5 more than three times a bus pass (p), the expression is 3p + 5."
                    </div>
                )}
             </div>
             {p1Phase === 'eq' ? (
                <div className="w-full space-y-6">
                   <p className="text-center text-gray-300 font-bold">Pick the correct equation (x = pen cost):</p>
                   <div className="grid grid-cols-1 gap-4">
                      {[{id:'A', text:"x + (2x + 3) = 18"}, {id:'B', text:"x + 2x = 18"}, {id:'C', text:"3x + 18 = 2x"}].map(o => (
                        <button key={o.id} onClick={() => setP1Eq(o.id)} className={`p-5 rounded-xl text-left text-xl font-mono text-white transition-all border-2 ${p1Eq === o.id ? 'bg-sky-600 border-sky-400' : 'bg-gray-900 border-gray-700'}`}>{o.text}</button>
                      ))}
                   </div>
                   <button onClick={handleP1} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest active:scale-95">Check</button>
                </div>
             ) : (
                <div className="animate-fade-in-up space-y-8 w-full max-w-sm">
                   <p className="text-center text-emerald-400 font-black text-2xl uppercase">Solve 3x + 3 = 18</p>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-2xl"><span className="font-bold text-white">Pen (x):</span><div className="flex items-center gap-2"><span className="text-gray-400">$</span><input type="number" value={p1Pen} onChange={e => setP1Pen(e.target.value)} className={`w-24 bg-gray-900 border-4 rounded-xl p-2 text-center text-white ${p1Errors.has('pen') ? 'border-red-500' : 'border-sky-500'}`} /></div></div>
                      <div className="flex items-center justify-between text-2xl"><span className="font-bold text-white">Notebook (2x+3):</span><div className="flex items-center gap-2"><span className="text-gray-400">$</span><input type="number" value={p1Notebook} onChange={e => setP1Notebook(e.target.value)} className={`w-24 bg-gray-900 border-4 rounded-xl p-2 text-center text-white ${p1Errors.has('notebook') ? 'border-red-500' : 'border-sky-500'}`} /></div></div>
                   </div>
                   <button onClick={handleP1} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest active:scale-95">Check</button>
                </div>
             )}
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col items-center">
             <h2 className="text-xl font-bold text-sky-400 mb-6 uppercase tracking-widest text-center">Problem 2: Group Admission</h2>
             <div className="bg-gray-900/50 p-8 rounded-2xl mb-10 border-l-4 border-indigo-500">
                <p className="text-2xl leading-relaxed italic text-white">"3 adults ($12 each) and some students ($6 each) went to the movies. The total was <span className="text-emerald-400">$54</span>. How many students?"</p>
             </div>
             {p2Phase === 'eq' ? (
                <div className="w-full space-y-6">
                   <p className="text-center font-bold text-gray-300">Choose the matching equation (x = student count):</p>
                   <div className="grid grid-cols-1 gap-4">
                      {[{id:'A', text:"12 + 6x = 54"}, {id:'C', text:"3(12) + 6x = 54"}].map(o => (
                        <button key={o.id} onClick={() => setP2Eq(o.id)} className={`p-5 rounded-xl text-left text-xl font-mono text-white transition-all border-2 ${p2Eq === o.id ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-900 border-gray-700'}`}>{o.text}</button>
                      ))}
                   </div>
                   <button onClick={handleP2} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest">Check</button>
                </div>
             ) : (
                <div className="animate-fade-in-up space-y-8 w-full max-w-sm">
                   <p className="text-center text-emerald-400 font-black text-2xl uppercase">Solve 36 + 6x = 54</p>
                   <div className="flex items-center justify-center gap-4 text-4xl"><span className="font-mono text-white">x = </span><input type="number" value={p2Students} onChange={e => setP2Students(e.target.value)} className="w-24 bg-gray-900 border-4 border-emerald-500 p-3 rounded-xl text-center text-white" /></div>
                   <button onClick={handleP2} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest">Check</button>
                </div>
             )}
          </div>
        )}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col items-center">
             <h2 className="text-xl font-bold text-sky-400 mb-6 uppercase tracking-widest text-center">Problem 3: Numerical Mystery</h2>
             <div className="bg-gray-900/50 p-8 rounded-2xl mb-10 border-l-4 border-orange-500">
                <p className="text-2xl leading-relaxed italic text-white">"3 times a number decreased by 4 is the same as twice the number increased by 5."</p>
             </div>
             {p3Phase === 'eq' ? (
                <div className="w-full space-y-6 max-w-md">
                   <p className="text-center text-gray-300 font-bold">Write the full equation:</p>
                   <input type="text" value={p3EqInput} onChange={e => setP3EqInput(e.target.value)} className="w-full bg-gray-900 border-4 border-sky-500 p-4 rounded-xl text-center text-2xl font-mono text-white" placeholder="e.g. 3x - 4 = ..." />
                   <button onClick={handleP3} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest">Check</button>
                </div>
             ) : (
                <div className="animate-fade-in-up space-y-8 w-full max-w-sm">
                   <p className="text-center text-emerald-400 font-black text-2xl uppercase">Solve for x</p>
                   <div className="flex items-center justify-center gap-4 text-4xl"><span className="font-mono text-white">x = </span><input type="number" value={p3Value} onChange={e => setP3Value(e.target.value)} className="w-24 bg-gray-900 border-4 border-emerald-500 p-3 rounded-xl text-center text-white" /></div>
                   <button onClick={handleP3} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xl uppercase tracking-widest">Check</button>
                </div>
             )}
          </div>
        )}
        {feedback && (
          <div className={`mt-8 p-4 rounded-xl text-center font-bold animate-fade-in border-2 ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/50'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionQuestLevel2;
