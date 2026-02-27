
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import ProgressDots from '../components/ProgressDots';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';

const PatternLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<number>(() => partialProgress?.step || 1);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  
  const [t1Behavior, setT1Behavior] = useState('');
  const [t1Value, setT1Value] = useState('');
  const [t1Term3, setT1Term3] = useState('');

  const [t2Values, setT2Values] = useState({ 5: '', 6: '', 7: '' });
  const [t2Behavior, setT2Behavior] = useState('');
  const [t2Term9, setT2Term9] = useState('');

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step, errorCount });
      }
    };
  }, [onSavePartialProgress, step, errorCount]);

  const handleCorrect = () => {
    setFeedback({ type: 'correct' });
    setTimeout(() => {
      setFeedback(null);
      if (step < 2) setStep(step + 1);
      else {
        setIsLevelComplete(true);
      }
    }, 1500);
  };

  const handleIncorrect = (msg: string) => {
    setFeedback({ type: 'incorrect', message: msg });
    setErrorCount(prev => prev + 1);
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    window.location.reload();
  };

  const validateT1 = () => {
    setFeedback(null);
    if (t1Behavior === 'increases' && t1Value === '4' && t1Term3 === '11') handleCorrect();
    else handleIncorrect("Check the sequence: 3, 7, 11... how much is added each time?");
  };

  const validateT2 = () => {
    setFeedback(null);
    const v5 = parseInt(t2Values[5]);
    const v6 = parseInt(t2Values[6]);
    const v7 = parseInt(t2Values[7]);
    if (v5 === 25 && v6 === 22 && v7 === 19 && t2Behavior === 'decreases' && t2Term9 === '13') handleCorrect();
    else handleIncorrect("Check the subtraction! For the 9th term, keep subtracting 3 until n=9.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-4xl mx-auto">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
        <ProgressDots currentStep={step} totalSteps={2} />
      </div>

      {isLevelComplete && (
        <ChallengeCompleteModal
          stars={errorCount === 0 ? 3 : errorCount === 1 ? 2 : 1}
          onReplay={handleReplay}
          onBackToMap={() => { isCompletedRef.current = true; onComplete(errorCount === 0 ? 3 : errorCount === 1 ? 2 : 1); }}
        />
      )}

      {feedback && (
        <div className={`fixed top-24 px-6 py-3 rounded-xl font-bold z-50 animate-fade-in ${feedback.type === 'correct' ? 'bg-emerald-500' : 'bg-rose-600'}`}>
          {feedback.type === 'correct' ? '🌟 Correct!' : feedback.message}
        </div>
      )}

      <div className="w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
        {step === 1 ? (
          <div className="text-center animate-fade-in">
            <div className="bg-gray-900 p-6 rounded-2xl mb-8 text-4xl font-mono text-indigo-300 tracking-widest shadow-inner">3, 7, 11, 15, 19, 23, ...</div>
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 text-xl font-semibold">
                <span>The pattern</span>
                <select className="bg-gray-700 px-2 rounded" value={t1Behavior} onChange={e => setT1Behavior(e.target.value)}>
                  <option value="">--</option><option value="increases">increases</option><option value="decreases">decreases</option>
                </select>
                <span>by</span>
                <input type="number" className="w-12 bg-gray-700 text-center rounded" value={t1Value} onChange={e => setT1Value(e.target.value)} />
                <span>each time!</span>
              </div>
              <div className="text-xl font-semibold">
                <span>What's the 3rd term?</span>
                <input type="number" className="ml-2 w-16 bg-gray-700 text-center rounded" value={t1Term3} onChange={e => setT1Term3(e.target.value)} />
              </div>
              <button onClick={validateT1} className="bg-sky-600 px-8 py-3 rounded-xl font-bold hover:bg-sky-500 transition-all">Check Answer</button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <table className="w-48 border-collapse">
                <thead><tr className="bg-gray-700"><th>n</th><th>Value</th></tr></thead>
                <tbody>
                  {[1,2,3,4].map(n => <tr key={n}><td className="border border-gray-600 p-2 text-center">{n}</td><td className="border border-gray-600 p-2 text-center">{37 - (n-1)*3}</td></tr>)}
                  {[5,6,7].map(n => <tr key={n}><td className="border border-gray-600 p-2 text-center">{n}</td><td className="border border-gray-600 p-2"><input type="number" className="w-full bg-gray-700 text-center" value={t2Values[n as 5|6|7]} onChange={e => setT2Values({...t2Values, [n]: e.target.value})} /></td></tr>)}
                </tbody>
              </table>
              <div className="space-y-4">
                 <div className="flex gap-2 text-xl font-semibold"><span>The pattern</span><select className="bg-gray-700" value={t2Behavior} onChange={e => setT2Behavior(e.target.value)}><option value="">--</option><option value="increases">increases</option><option value="decreases">decreases</option></select><span>by 3!</span></div>
                 <div className="flex gap-2 text-xl font-semibold"><span>9th term?</span><input type="number" className="w-16 bg-gray-700 text-center" value={t2Term9} onChange={e => setT2Term9(e.target.value)} /></div>
                 <button onClick={validateT2} className="w-full bg-sky-600 py-3 rounded-xl font-bold">Check Table</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternLevel1;
