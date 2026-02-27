
import React from 'react';

interface ChallengeCompleteModalProps {
  stars: number;
  onReplay: () => void;
  onBackToMap: () => void;
  onNext?: () => void;
  isFinalLevel?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; outlined?: boolean }> = ({ filled, outlined = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill={filled ? "#FACC15" : "none"}
    stroke={outlined ? "#6B7280" : "none"}
    strokeWidth={outlined ? "1.5" : "0"}
    className="w-12 h-12"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ChallengeCompleteModal: React.FC<ChallengeCompleteModalProps> = ({ 
  stars, 
  onReplay, 
  onBackToMap, 
  onNext,
  isFinalLevel = false 
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="bg-gray-800 border-2 border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2 className={`text-4xl font-bold mb-6 ${stars === 1 ? 'text-orange-400' : 'text-emerald-400'}`}>
          {stars === 1 ? 'Good Effort!' : 'Level Complete!'}
        </h2>

        {/* Stars Display */}
        <div className="flex justify-center gap-2 mb-6">
          <StarIcon filled={stars >= 1} outlined={stars < 1} />
          <StarIcon filled={stars >= 2} outlined={stars < 2} />
          <StarIcon filled={stars >= 3} outlined={stars < 3} />
        </div>

        {/* 1 Star Message */}
        {stars === 1 && (
          <>
            <p className="text-orange-200 font-bold mb-2 text-lg">
              You need 2 stars to unlock the next level.
            </p>
            <p className="text-gray-300 mb-8">
              Answer correctly on the first try to earn more stars!
            </p>
          </>
        )}

        {/* 2 Stars Message */}
        {stars === 2 && (
          <p className="text-gray-300 mb-8">
            Answer correctly on the first try to earn more stars!
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* For 3 stars: show only Next Level (or Back to Map if final) */}
          {stars === 3 ? (
            isFinalLevel || !onNext ? (
              <button
                onClick={(e) => { e.preventDefault(); onBackToMap(); }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Back to Map
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); onNext?.(); }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Next Level
              </button>
            )
          ) : stars === 2 ? (
            /* For 2 stars: show Replay and Next Level/Back to Map */
            <>
              <button
                onClick={(e) => { e.preventDefault(); onReplay(); }}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Replay
              </button>
              
              {isFinalLevel || !onNext ? (
                <button
                  onClick={(e) => { e.preventDefault(); onBackToMap(); }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Back to Map
                </button>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); onNext?.(); }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Next Level
                </button>
              )}
            </>
          ) : (
            /* For 1 star: show only Replay button */
            <button
              onClick={(e) => { e.preventDefault(); onReplay(); }}
              className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCompleteModal;
