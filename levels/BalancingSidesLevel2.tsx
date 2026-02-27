
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

type TileType = 'x' | 'unit';
interface TileInstance { id: string; type: TileType; }

const PanView: React.FC<{ items: TileInstance[]; side: 'left' | 'right'; step: number; crossedOutIds: Set<string>; onToggle: (id: string) => void; }> = ({ items, side, step, crossedOutIds, onToggle }) => {
  return (
    <div className="w-40 h-40 bg-gray-700/50 rounded-xl border-4 border-slate-500 relative flex flex-wrap content-start p-2 gap-1 overflow-hidden shadow-inner -translate-y-[120px]">
        {items.map(item => (
            <div 
                key={item.id} 
                onClick={() => (step === 2 || step === 3) && onToggle(item.id)}
                className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative ${item.type === 'x' ? 'bg-sky-500 text-white' : 'bg-yellow-500 text-gray-900'} ${crossedOutIds.has(item.id) ? 'opacity-30' : ''}`}
            >
                {crossedOutIds.has(item.id) && <div className="absolute inset-0 flex items-center justify-center text-red-600 font-black text-2xl">X</div>}
                {item.type === 'x' ? 'x' : '1'}
            </div>
        ))}
    </div>
  );
};

const ControlGroup: React.FC<{ title: string; side: 'left' | 'right'; onAdd: (side: 'left' | 'right', type: TileType) => void; }> = ({ title, side, onAdd }) => (
    <div className="flex flex-col gap-3">
        <h4 className="text-xs font-black text-gray-400 text-center uppercase tracking-wider">{title}</h4>
        <div className="flex gap-2">
            <button onClick={() => onAdd(side, 'x')} className="w-14 h-14 bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center justify-center font-bold text-xl transition-colors shadow-md">x</button>
            <button onClick={() => onAdd(side, 'unit')} className="w-14 h-14 bg-yellow-600 hover:bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-xl transition-colors shadow-md">1</button>
        </div>
    </div>
);

const InverseDictionary: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[250] p-4 font-sans" onClick={onClose}>
      <div className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-6 max-w-sm w-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-tighter">Dictionary</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-2 border border-slate-700 rounded-lg overflow-hidden text-sm bg-slate-900/50">
          <div className="bg-slate-700 p-3 font-bold border-b border-r border-slate-600 text-white">Operation</div>
          <div className="bg-slate-700 p-3 font-bold border-b border-slate-600 text-white">Inverse (opposite)</div>
          <div className="p-3 border-b border-r border-slate-700 font-medium text-white">Addition (+)</div>
          <div className="p-3 border-b border-slate-700 font-medium text-emerald-400">Subtraction (-)</div>
          <div className="p-3 border-b border-r border-slate-700 font-medium text-white">Subtraction (-)</div>
          <div className="p-3 border-b border-slate-700 font-medium text-emerald-400">Addition (+)</div>
          <div className="p-3 border-b border-r border-slate-700 font-medium text-white">Multiplication (×)</div>
          <div className="p-3 border-b border-slate-700 font-medium text-emerald-400">Division (÷)</div>
          <div className="p-3 border-b border-r border-slate-700 font-medium text-white">Division (÷)</div>
          <div className="p-3 font-medium text-emerald-400">Multiplication (×)</div>
        </div>
      </div>
    </div>
  );
};

const BalancingSidesLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [phase, setPhase] = useState<1 | 2>(() => partialProgress?.phase || 1);
  const [step, setStep] = useState<number>(() => partialProgress?.step || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const isCompletedRef = useRef(false);

  // Randomized values for Bar 1 (Phase 1)
  // Equation: TARGET_L_X*x + TARGET_L_U = TARGET_R_X*x + TARGET_R_U
  // To keep it simple: x=2 always in tutorial, but randomized coefficients
  const [config] = useState(() => partialProgress?.config || {
      L_X: 4, L_U: 4, R_X: 2, R_U: 8 // default: 4x+4=2x+8 => 2x=4 => x=2
  });

  const [leftPan, setLeftPan] = useState<TileInstance[]>(() => partialProgress?.leftPan || []);
  const [rightPan, setRightPan] = useState<TileInstance[]>(() => partialProgress?.rightPan || []);
  const [crossedOutIds, setCrossedOutIds] = useState<Set<string>>(new Set());
  const [p1FinalX, setP1FinalX] = useState(() => partialProgress?.p1FinalX || '');
  const [p1XError, setP1XError] = useState(false);

  const [p2Step, setP2Step] = useState(() => partialProgress?.p2Step || 1);
  const [p2Verify, setP2Verify] = useState(() => partialProgress?.p2Verify || { v1: '', v2: '', v3: '' });
  const [p2ShowHint, setP2ShowHint] = useState(false);
  const [p2VerifyErrors, setP2VerifyErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ phase, step, p2Step, errorCount, leftPan, rightPan, p1FinalX, p2Verify, config });
      }
    };
  }, [onSavePartialProgress, phase, step, p2Step, errorCount, leftPan, rightPan, p1FinalX, p2Verify, config]);

  const leftX = leftPan.filter(t => t.type === 'x').length;
  const leftU = leftPan.filter(t => t.type === 'unit').length;
  const rightX = rightPan.filter(t => t.type === 'x').length;
  const rightU = rightPan.filter(t => t.type === 'unit').length;

  const handleAddTile = (pan: 'left' | 'right', type: TileType) => {
    if (step !== 1) return;
    const newTile = { id: Math.random().toString(36).substr(2, 9), type };
    if (pan === 'left') setLeftPan([...leftPan, newTile]);
    else setRightPan([...rightPan, newTile]);
  };

  const handleToggleCross = (id: string) => {
    if (step !== 2 && step !== 3) return;
    const newSet = new Set(crossedOutIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setCrossedOutIds(newSet);
  };

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    setFeedback({ message: msg, type });
    if (type === 'error') {
      setErrorCount(prev => prev + 1);
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleCheckStep1 = () => {
    if (leftX === config.L_X && leftU === config.L_U && rightX === config.R_X && rightU === config.R_U) {
      showFeedback("Correct! You have balanced the initial equation.", 'success');
      setTimeout(() => { setStep(2); setShowHint(false); setFeedback(null); }, 1000);
    } else {
      showFeedback(`Incorrect. Check the counts! You need ${config.L_X} 'x' and ${config.L_U} units on the left.`, 'error');
    }
  };

  const handleCheckStep2 = () => {
    const remLU = leftPan.filter(t => t.type === 'unit' && crossedOutIds.has(t.id)).length;
    const remRU = rightPan.filter(t => t.type === 'unit' && crossedOutIds.has(t.id)).length;
    const remLX = leftPan.filter(t => t.type === 'x' && crossedOutIds.has(t.id)).length;
    const remRX = rightPan.filter(t => t.type === 'x' && crossedOutIds.has(t.id)).length;

    if (remLU === config.L_U && remRU === config.L_U && remLX === 0 && remRX === 0) {
      showFeedback("Great job! Removing units from both sides keeps it level.", 'success');
      setTimeout(() => {
        setLeftPan(prev => prev.filter(t => !crossedOutIds.has(t.id)));
        setRightPan(prev => prev.filter(t => !crossedOutIds.has(t.id)));
        setCrossedOutIds(new Set());
        setStep(3);
        setShowHint(false);
        setFeedback(null);
      }, 1500);
    } else {
      showFeedback(`Wrong tiles. Concept: If you had 10 on each side, removing 5 from both would keep it balanced.`, 'error');
    }
  };

  const handleCheckStep3 = () => {
    const remLX = leftPan.filter(t => t.type === 'x' && crossedOutIds.has(t.id)).length;
    const remRX = rightPan.filter(t => t.type === 'x' && crossedOutIds.has(t.id)).length;
    const remU = [...leftPan, ...rightPan].filter(t => t.type === 'unit' && crossedOutIds.has(t.id)).length;

    if (remLX === config.R_X && remRX === config.R_X && remU === 0) {
      showFeedback("Perfect! You isolated the variables.", 'success');
      setTimeout(() => {
        setLeftPan(prev => prev.filter(t => !crossedOutIds.has(t.id)));
        setRightPan(prev => prev.filter(t => !crossedOutIds.has(t.id)));
        setCrossedOutIds(new Set());
        setStep(4);
        setShowHint(false);
        setFeedback(null);
      }, 1500);
    } else {
      showFeedback("Incorrect. Concept: To solve 5y = 2y + 9, you'd take away 2y from both sides.", 'error');
    }
  };

  const handleP1XCheck = () => {
    const val = parseFloat(p1FinalX);
    if (!isNaN(val) && val === 2) {
      showFeedback("Correct! x = 2.", 'success');
      setTimeout(() => { setPhase(2); setStep(1); setFeedback(null); }, 1500);
    } else {
      setP1XError(true);
      showFeedback("Think: If 5 identical bags weigh 10kg, how much is one bag? (10 / 5)", 'error');
      setTimeout(() => setP1XError(false), 2000);
    }
  };

  const handleAction = (val: string) => {
    if (p2Step === 1) {
        if (val === 'Add 2y to both sides') { setP2Step(2); setFeedback(null); }
        else showFeedback("Wrong move. Concept: If you have -5 on one side, you'd add 5 to both sides to cancel it out.", 'error');
    }
    else if (p2Step === 2) {
        if (val === 'Subtract 50 from both sides') { setP2Step(3); setFeedback(null); }
        else showFeedback("Try again. Concept: To move a +10 to the other side, subtract 10 from both sides.", 'error');
    }
    else if (p2Step === 3) {
        if (val === 'Divide both sides by 5') { setP2Step(4); setFeedback(null); }
        else showFeedback("Not quite. Concept: If 10z = 100, divide both sides by 10 to find z.", 'error');
    }
    setP2ShowHint(false);
  };

  const handleVerify = () => {
    const v1Val = p2Verify.v1.trim();
    const v2Val = p2Verify.v2.trim();
    const v3Val = p2Verify.v3.trim();
    const newErrors = new Set<string>();
    if (v1Val !== '-8') newErrors.add('v1');
    if (v2Val !== '-8') newErrors.add('v2');
    if (v3Val !== '26') newErrors.add('v3');
    if (newErrors.size === 0) setIsLevelComplete(true);
    else { setP2VerifyErrors(newErrors); setErrorCount(prev => prev + 1); setTimeout(() => setP2VerifyErrors(new Set()), 2000); }
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center min-h-full p-4 text-white bg-gray-900 font-sans max-w-6xl mx-auto pb-24 relative">
      <InverseDictionary isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={phase} totalSteps={2} onStepClick={(s) => setPhase(s as 1 | 2)} />
      </div>
      
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Balance Challenges">
         <p>Equations are like playground seesaws. Whatever you do to one side, you MUST do to the other to keep it level!</p>
         <div className="mt-4 p-4 bg-sky-900/30 rounded-lg border border-sky-500/30">
            <p className="text-sky-300 font-bold mb-1">Concept Hint:</p>
            <p className="italic">"If you add a 5lb weight to the left, the seesaw tips. Add 5lb to the right, and it's level again."</p>
        </div>
      </InstructionModal>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount <= 3 ? 2 : 1}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : 2); }}
          hintMessage="Focus on perfect balance to earn all 3 stars!"
        />
      )}

      {phase === 1 && (
        <div className="w-full animate-fade-in flex flex-col items-center">
          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-3xl mb-4 text-center shadow-2xl relative">
            <h2 className="text-sky-300 font-bold uppercase tracking-widest text-2xl mb-6">Physical Equation Model</h2>
            <div className="flex flex-col gap-2 font-mono text-4xl text-white tracking-wide">
              <div>{config.L_X}x + {config.L_U} = {config.R_X}x + {config.R_U}</div>
              {step >= 3 && <div className="text-yellow-400 text-xl font-bold animate-fade-in">&nbsp;&nbsp;&nbsp;&nbsp;- {config.L_U}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- {config.L_U}</div>}
              {step >= 3 && <div>{config.L_X}x = {config.R_X}x + {config.R_U - config.L_U}</div>}
              {step >= 4 && <div className="text-yellow-400 text-xl font-bold animate-fade-in">-{config.R_X}x&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-{config.R_X}x</div>}
              {step >= 4 && <div>{config.L_X - config.R_X}x = {config.R_U - config.L_U}</div>}
            </div>
          </div>

          {step === 4 && (
              <div className="bg-emerald-900/60 p-6 rounded-3xl border-2 border-emerald-400 text-center animate-fade-in-up w-full max-w-3xl shadow-xl mb-8">
                 <p className="text-lg mb-4 text-emerald-100 font-bold uppercase tracking-tight">Step 4. Final Solution</p>
                 <p className="text-lg mb-4 text-emerald-100 font-bold">If <span className="font-mono text-xl text-emerald-400">{config.L_X - config.R_X}x = {config.R_U - config.L_U}</span>, what is x?</p>
                 <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-3xl font-mono text-white">x = </span>
                        <input type="number" className={`w-20 bg-gray-800 border-2 rounded-xl p-3 text-3xl font-bold text-center text-white outline-none ${p1XError ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p1FinalX} onChange={e => setP1FinalX(e.target.value)} />
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleP1XCheck} className="w-48 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 uppercase tracking-wider">Check</button>
                        <button onClick={() => setP1FinalX('')} className="w-32 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 uppercase tracking-wider">Reset</button>
                    </div>
                 </div>
              </div>
            )}

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 mb-8 max-w-xl w-full text-center relative min-h-[140px] flex flex-col justify-center shadow-lg">
            {step === 1 && (
                <>
                    <p className="text-sky-400 font-bold animate-pulse mb-4 text-lg">Step 1. Model <span className="font-mono">{config.L_X}x + {config.L_U} = {config.R_X}x + {config.R_U}</span>.</p>
                    <div className="flex gap-4 justify-center mb-2">
                        <button onClick={handleCheckStep1} className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Check</button>
                        <button onClick={() => { setLeftPan([]); setRightPan([]); }} className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Reset Pans</button>
                    </div>
                    <button onClick={() => setShowHint(!showHint)} className="mt-2 text-yellow-400 hover:text-yellow-300 font-bold uppercase text-xs tracking-widest">💡 Hint</button>
                    {showHint && <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-100 text-sm animate-fade-in-up">"To model 3a + 5 = 20, you would place three 'a' squares and five '1' units on one pan, and twenty units on the other."</div>}
                </>
            )}
            {step === 2 && (
              <>
                <p className="text-sky-400 font-bold mb-4 text-lg">Step 2. Remove units from BOTH sides.</p>
                <div className="flex gap-4 justify-center mb-2">
                    <button onClick={handleCheckStep2} className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Check</button>
                    <button onClick={() => setCrossedOutIds(new Set())} className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Reset Crosses</button>
                </div>
                <button onClick={() => setShowHint(!showHint)} className="mt-2 text-yellow-400 hover:text-yellow-300 font-bold uppercase text-xs tracking-widest">💡 Hint</button>
                {showHint && <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-100 text-sm animate-fade-in-up">"If you had 10 blocks on each side of a scale, removing 4 from BOTH would keep it level. Try removing all units from the left pan first!"</div>}
              </>
            )}
            {step === 3 && (
              <>
                <p className="text-sky-400 font-bold mb-4 text-lg">Step 3. Remove x-tiles from BOTH sides.</p>
                <div className="flex gap-4 justify-center mb-2">
                    <button onClick={handleCheckStep3} className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Check</button>
                    <button onClick={() => setCrossedOutIds(new Set())} className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm">Reset Crosses</button>
                </div>
                <button onClick={() => setShowHint(!showHint)} className="mt-2 text-yellow-400 hover:text-yellow-300 font-bold uppercase text-xs tracking-widest">💡 Hint</button>
                {showHint && <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-100 text-sm animate-fade-in-up">"Imagine 6x on the left and 4x on the right. You can take away 4x from BOTH sides to simplify it to 2x on the left."</div>}
              </>
            )}
            {feedback && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-bold animate-fade-in border-2 shadow-sm ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-shake'}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="relative w-full h-[320px] flex items-center justify-center mt-10">
            <div className="absolute w-[80%] h-3 bg-slate-600 rounded-full z-10" style={{ transform: `rotate(${(leftX*2+leftU - (rightX*2+rightU)) * -2}deg)` }}>
              <div className="absolute left-0 top-0 -translate-x-1/2 flex flex-col items-center">
                 <PanView items={leftPan} side="left" step={step} crossedOutIds={crossedOutIds} onToggle={handleToggleCross} />
              </div>
              <div className="absolute right-0 top-0 translate-x-1/2 flex flex-col items-center">
                 <PanView items={rightPan} side="right" step={step} crossedOutIds={crossedOutIds} onToggle={handleToggleCross} />
              </div>
            </div>
            <div className="absolute bottom-0 w-8 h-48 bg-slate-700 rounded-t-xl" />
          </div>

          {step === 1 && (
            <div className="mt-24 flex gap-10 bg-gray-800/50 p-8 rounded-3xl border border-gray-700 shadow-2xl">
                <ControlGroup title="Add to Left" side="left" onAdd={handleAddTile} />
                <ControlGroup title="Add to Right" side="right" onAdd={handleAddTile} />
            </div>
          )}
        </div>
      )}

      {phase === 2 && (
        <div className="w-full animate-fade-in">
           <div className="flex flex-col items-center gap-3 mb-10 text-white">
              <h2 className="text-sky-300 font-bold uppercase tracking-widest text-3xl text-center">Algebraic Operations</h2>
              <div className="flex gap-6 mt-4">
                <button onClick={() => setIsDictOpen(true)} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 p-3 rounded-full transition-all border-2 border-indigo-400/30 shadow-lg scale-110" title="Inverse Operations Dictionary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </button>
                <button onClick={() => setP2ShowHint(!p2ShowHint)} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-3 rounded-full transition-all border-2 border-yellow-400/30 shadow-lg scale-110" title="Get a hint">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </button>
              </div>
              <div className="h-14">
                {p2ShowHint && (
                  <div className="bg-yellow-100 text-yellow-900 p-3 rounded-xl shadow-lg text-sm font-bold animate-fade-in-up border-2 border-yellow-300">
                    {p2Step === 1 && "Concept: If you see -10p, you would add +10p to both sides to cancel it out."}
                    {p2Step === 2 && "Concept: If you have +5 on one side, you'd subtract 5 from both sides to balance."}
                    {p2Step === 3 && "Concept: If 2x = 20, you would divide by 2 to find x."}
                  </div>
                )}
                {feedback && (
                   <div className={`p-3 rounded-xl shadow-lg text-sm font-bold animate-fade-in border-2 ${feedback.type === 'error' ? 'bg-red-100 text-red-900 border-red-300 animate-shake' : 'bg-emerald-100 text-emerald-900 border-emerald-300'}`}>{feedback.message}</div>
                )}
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto relative">
             <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-xl min-h-[400px] relative">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110]">
                    <ProgressDots currentStep={p2Step} totalSteps={4} onStepClick={(s) => setP2Step(s)} />
                </div>
                <h3 className="text-gray-400 uppercase text-xs font-black mb-6 tracking-[0.2em] mt-8">Solution steps</h3>
                <div className="font-mono text-2xl space-y-4 text-white">
                  <div className="border-l-4 border-gray-600 pl-4 py-1 tracking-wider">10 - 2y = 3y + 50</div>
                  {p2Step >= 2 && (
                    <div className="animate-fade-in">
                      <div className="text-indigo-400 font-bold mb-1 flex items-center flex-wrap">
                        10 - 2y <span className="bg-indigo-500/20 px-1 ml-1 text-white">+ 2y</span> = 3y <span className="bg-indigo-500/20 px-1 ml-1 text-white">+ 2y</span> + 50
                      </div>
                      <div className="border-l-4 border-emerald-500 pl-4 py-1 text-white">10 = 5y + 50</div>
                    </div>
                  )}
                  {p2Step >= 3 && (
                    <div className="animate-fade-in">
                      <div className="text-indigo-400 font-bold mb-1 flex items-center flex-wrap">
                        10 <span className="bg-indigo-500/20 px-1 ml-1 text-white">- 50</span> = 5y + 50 <span className="bg-indigo-500/20 px-1 ml-1 text-white">- 50</span>
                      </div>
                      <div className="border-l-4 border-emerald-500 pl-4 py-1 text-white">-40 = 5y</div>
                    </div>
                  )}
                  {p2Step >= 4 && (
                    <div className="animate-fade-in">
                      <div className="text-indigo-400 font-bold mb-1 flex items-center gap-4 pl-4 py-2">
                        <span className="bg-indigo-500/20 px-2 text-white">÷ 5</span>
                        <span className="bg-indigo-500/20 px-2 text-white">÷ 5</span>
                      </div>
                      <div className="border-l-4 border-emerald-500 pl-4 py-1 text-white">-8 = y</div>
                    </div>
                  )}
                </div>
             </div>
             <div className="space-y-6">
                {p2Step === 1 && (
                  <div className="bg-indigo-900/30 p-8 rounded-3xl border-2 border-indigo-500 shadow-lg animate-fade-in">
                    <p className="text-indigo-100 font-bold text-lg mb-4 uppercase tracking-tight">Step 1. Group Variable Terms</p>
                    <select onChange={(e) => { handleAction(e.target.value); e.target.value = ""; }} className="w-full bg-gray-800 text-white p-4 rounded-xl border-2 border-indigo-400 font-bold text-lg" defaultValue="">
                      <option value="" disabled>Select an action...</option>
                      <option value="Add 3y to both sides">Add 3y to both sides</option>
                      <option value="Add 2y to both sides">Add 2y to both sides</option>
                    </select>
                  </div>
                )}
                {p2Step === 2 && (
                  <div className="bg-indigo-900/30 p-8 rounded-3xl border-2 border-indigo-500 shadow-lg animate-fade-in">
                    <p className="text-indigo-100 font-bold text-lg mb-4 uppercase tracking-tight">Step 2. Group Constants</p>
                    <select onChange={(e) => { handleAction(e.target.value); e.target.value = ""; }} className="w-full bg-gray-800 text-white p-4 rounded-xl border-2 border-indigo-400 font-bold text-lg" defaultValue="">
                      <option value="" disabled>Select an action...</option>
                      <option value="Subtract 50 from both sides">Subtract 50 from both sides</option>
                      <option value="Subtract 10 from both sides">Subtract 10 from both sides</option>
                    </select>
                  </div>
                )}
                {p2Step === 3 && (
                  <div className="bg-indigo-900/30 p-8 rounded-3xl border-2 border-indigo-500 shadow-lg animate-fade-in">
                    <p className="text-indigo-100 font-bold text-lg mb-4 uppercase tracking-tight">Step 3. Isolate the Variable</p>
                    <select onChange={(e) => { handleAction(e.target.value); e.target.value = ""; }} className="w-full bg-gray-800 text-white p-4 rounded-xl border-2 border-indigo-400 font-bold text-lg" defaultValue="">
                      <option value="" disabled>Select an action...</option>
                      <option value="Divide both sides by 5">Divide both sides by 5</option>
                      <option value="Multiply both sides by 5">Multiply both sides by 5</option>
                    </select>
                  </div>
                )}
                {p2Step >= 4 && (
                  <div className="bg-emerald-900/30 p-8 rounded-3xl border-2 border-emerald-500 shadow-lg animate-fade-in space-y-6">
                    <h3 className="text-emerald-300 font-black uppercase text-sm tracking-widest text-center">Step 4. Verify your solution</h3>
                    <div className="bg-gray-900/50 p-6 rounded-2xl space-y-8 font-mono text-xl shadow-inner">
                       <div className="flex flex-col items-center gap-6">
                          <div className="flex items-center gap-2 flex-wrap justify-center leading-relaxed">
                            <span className="text-white">10 - 2(</span>
                            <input type="text" className={`w-16 bg-gray-800 border-b-2 text-center text-white focus:outline-none transition-colors py-1 ${p2VerifyErrors.has('v1') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p2Verify.v1} onChange={e => setP2Verify({...p2Verify, v1: e.target.value})} placeholder="y" />
                            <span className="text-white">) = 3(</span>
                            <input type="text" className={`w-16 bg-gray-800 border-b-2 text-center text-white focus:outline-none transition-colors py-1 ${p2VerifyErrors.has('v2') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p2Verify.v2} onChange={e => setP2Verify({...p2Verify, v2: e.target.value})} placeholder="y" />
                            <span className="text-white">) + 50</span>
                          </div>
                          <div className="flex items-center gap-4 text-emerald-400">
                             <input type="text" className={`w-20 h-20 bg-gray-800 border-2 rounded-xl text-center text-white text-3xl font-bold focus:outline-none transition-all shadow-inner ${p2VerifyErrors.has('v3') ? 'border-red-500 animate-shake' : 'border-emerald-500'}`} value={p2Verify.v3} onChange={e => setP2Verify({...p2Verify, v3: e.target.value})} placeholder="?" />
                             <span className="text-white font-black text-3xl">= 26</span>
                          </div>
                       </div>
                       <button onClick={handleVerify} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-lg uppercase tracking-wider">Check</button>
                    </div>
                  </div>
                )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BalancingSidesLevel2;
