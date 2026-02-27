
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Level, PlayerProgress, Lesson, QuizQuestion, LevelComponentProps } from './types';
import { LevelStatus } from './types';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { playSuccessSound } from './services/audioService';
import { ToolbarProvider } from './hooks/useToolbarState';

import LevelView from './components/LevelView';
// Import Trial and Error Levels
import TrialAndErrorLevel1 from './levels/TrialAndErrorLevel1';
import BalancingSidesLevel2 from './levels/BalancingSidesLevel2';
import UnlockVariableLevel3 from './levels/UnlockVariableLevel3';
import ShapesEquationsLevel1 from './levels/ShapesEquationsLevel1';
import SolutionQuestLevel2 from './levels/SolutionQuestLevel2';

// --- Icon Components ---
const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill={filled ? "#FACC15" : "#374151"} 
        className={className}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" />
    </svg>
);

const VideoPlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

const AVATAR_UNLOCK_THRESHOLD = 12;

const PlayerStatusDisplay: React.FC<{ totalStars: number; selectedAvatar: string | null }> = ({ totalStars, selectedAvatar }) => {
    return (
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
            {selectedAvatar ? (
                <div 
                    className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm border-2 border-sky-400/50 rounded-full shadow-lg px-4 py-2"
                >
                    <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center text-2xl">
                        {selectedAvatar}
                    </div>
                    <div className="flex items-center gap-2">
                        <StarIcon className="w-6 h-6" filled={true} />
                        <span className="text-xl font-bold text-white tracking-wider">
                            {totalStars}
                        </span>
                    </div>
                </div>
            ) : (
                <div 
                    className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-400/50 rounded-full shadow-lg px-4 py-2"
                >
                    <StarIcon className="w-6 h-6" filled={true} />
                    <span className="text-xl font-bold text-white tracking-wider">
                        {totalStars}
                    </span>
                </div>
            )}
        </div>
    );
};

interface LessonExt extends Lesson {
    supplementaryVideos?: { id: string; title: string; url: string }[];
}

const LESSON_DEFINITIONS: LessonExt[] = [
    {
        title: "Algebraic Expressions",
        levels: [
            { id: 'trial-error-1', name: 'Level 1', description: 'Solve equations by testing different values.', component: TrialAndErrorLevel1, topic: 'Algebraic Methods' },
            { id: 'balancing-2', name: 'Level 2', description: 'Use a physical model to isolate variables.', component: BalancingSidesLevel2, topic: 'Algebraic Methods' },
            { id: 'unlock-variable-3', name: 'Level 3', description: 'Mastery: Solve and verify equations.', component: UnlockVariableLevel3, topic: 'Algebraic Methods' },
        ],
        supplementaryVideos: [
            { id: 'bonus-eq-intro', title: "Introduction to Equations", url: "https://app.binogi.ca/l/introduction-to-equations" }
        ]
    },
    {
        title: "Writing Equations",
        levels: [
            { id: 'shapes-equations-1', name: 'Level 1', description: 'Write equations for shapes and balances.', component: ShapesEquationsLevel1, topic: 'Geometry' },
            { id: 'solution-quest-2', name: 'Level 2', description: 'Solve complex word problems with algebra.', component: SolutionQuestLevel2, topic: 'Algebraic Word Problems' },
        ],
    }
];

const getLevelStatus = (level: Level, progress: PlayerProgress, lessonIndex: number, levelIndex: number): LevelStatus => {
    const score = progress[level.id] || 0;
    
    // Completed if score is 2 stars or higher
    if (score >= 2) {
        return LevelStatus.COMPLETED;
    }

    // First level is always unlocked
    if (lessonIndex === 0 && levelIndex === 0) {
        return LevelStatus.UNLOCKED;
    }

    // Previous level in same lesson must be completed (2+ stars)
    if (levelIndex > 0) {
        const prevLevel = LESSON_DEFINITIONS[lessonIndex].levels[levelIndex - 1];
        if ((progress[prevLevel.id] || 0) >= 2) return LevelStatus.UNLOCKED;
    } else if (lessonIndex > 0) {
        // Previous lesson must be fully completed to unlock first level of next lesson
        const prevLesson = LESSON_DEFINITIONS[lessonIndex - 1];
        const allPrevCompleted = prevLesson.levels.every(l => (progress[l.id] || 0) >= 2);
        if (allPrevCompleted) return LevelStatus.UNLOCKED;
    }

    // Check if explicitly unlocked via skip/unlock button (score of 3)
    if (score === 3) {
        return LevelStatus.UNLOCKED;
    }

    return LevelStatus.LOCKED;
};

const LevelNode: React.FC<{ level: Level; status: LevelStatus; stars: number; onSelectLevel: (id: string) => void; onCompleteLevel: (id: string, stars: number) => void; }> = ({ level, status, stars, onSelectLevel, onCompleteLevel }) => {
    const isLocked = status === LevelStatus.LOCKED;
    const isCompleted = status === LevelStatus.COMPLETED;

    return (
        <div className="flex flex-col items-center w-28 text-center">
            <button
                onClick={() => !isLocked && onSelectLevel(level.id)}
                disabled={isLocked}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl mb-2
                    ${isLocked ? 'bg-gray-800 border-2 border-gray-700 cursor-not-allowed' : 'bg-[#2563eb] border-2 border-white/20 hover:scale-110 active:scale-95'}
                `}
            >
                <PlayIcon className={`w-8 h-8 ${isLocked ? 'text-gray-600' : 'text-white'}`} />
            </button>
            <p className="font-bold text-xs text-white mb-1 uppercase tracking-tight">{level.name}</p>
            <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3].map((i) => (
                    <StarIcon key={i} filled={i <= stars} className="w-3.5 h-3.5" />
                ))}
            </div>
        </div>
    );
};

const BonusMissionCard: React.FC<{ 
    video: { id: string; title: string; url: string }; 
    stars: number; 
    onComplete: (id: string, stars: number) => void 
}> = ({ video, stars, onComplete }) => {
    const isCompleted = stars > 0;

    return (
        <div className={`relative w-44 rounded-2xl p-4 border shadow-2xl flex flex-col items-center transition-all duration-500 ${isCompleted ? 'bg-[#064e3b] border-[#059669]' : 'bg-[#1e293b] border-[#334155]'}`}>
            <div className={`absolute -top-3 text-[#111827] text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest shadow-md transition-colors ${isCompleted ? 'bg-[#10b981]' : 'bg-[#eab308]'}`}>
                {isCompleted ? 'Mission Complete' : 'Bonus Mission'}
            </div>
            <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mb-1 mt-2 shadow-inner border border-white/10 relative">
                <VideoPlayIcon className={`w-10 h-10 transition-colors ${isCompleted ? 'text-[#10b981]' : 'text-[#eab308]'}`} />
                {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg">
                        <StarIcon filled={true} className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 mb-2">
                <StarIcon filled={isCompleted} className="w-4 h-4" />
                <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#10b981]' : 'text-gray-400'}`}>+1 Star Reward</span>
            </div>
            <p className="text-white text-[11px] font-bold mb-3 text-center line-clamp-2 min-h-[2rem]">{video.title}</p>
            <a 
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onComplete(video.id, 1)}
                className={`w-full text-[10px] font-black uppercase tracking-widest py-2 rounded-md transition-all text-center ${isCompleted ? 'bg-[#059669] hover:bg-[#10b981] text-white' : 'bg-[#334155] hover:bg-[#475569] text-white'}`}
            >
                {isCompleted ? 'Watch Again' : 'Watch'}
            </a>
        </div>
    );
};

const LevelMap: React.FC<{ lessons: LessonExt[], progress: PlayerProgress; onSelectLevel: (id: string) => void; totalStars: number; selectedAvatar: string | null; onCompleteLevel: (id: string, stars: number) => void }> = ({ lessons, progress, onSelectLevel, totalStars, selectedAvatar, onCompleteLevel }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start pt-16 p-4 sm:p-8 bg-[#0a0f1e] overflow-x-hidden">
            <PlayerStatusDisplay totalStars={totalStars} selectedAvatar={selectedAvatar} />
            
            <div className="text-center mb-24 z-10">
                <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 pb-2 tracking-tighter drop-shadow-2xl">
                    Solving Equations
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100/80 font-bold mt-2">
                    Goal: <span className="font-medium italic">I can solve equations and verify solutions.</span>
                </p>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 w-full max-w-7xl">
                {/* Horizontal Path Line */}
                <div className="absolute top-[65%] left-0 w-full h-4 bg-[#451a03] hidden md:block rounded-full overflow-hidden">
                    <div className="h-full w-full border-t-2 border-dashed border-[#eab308] opacity-50"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between w-full relative z-10 gap-12 md:gap-4">
                    {/* Lesson 1 Card */}
                    <div className="bg-[#111827]/95 backdrop-blur-sm rounded-[2rem] p-8 border border-[#374151] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center">
                        <h2 className="text-xl font-black mb-8 text-[#60a5fa] uppercase tracking-widest">{lessons[0].title}</h2>
                        <div className="flex gap-8">
                            {lessons[0].levels.map((level, idx) => (
                                <LevelNode 
                                    key={level.id} 
                                    level={level} 
                                    status={getLevelStatus(level, progress, 0, idx)} 
                                    onSelectLevel={onSelectLevel} 
                                    stars={progress[level.id] || 0}
                                    onCompleteLevel={onCompleteLevel}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Central Bonus Mission */}
                    {lessons[0].supplementaryVideos?.[0] && (
                        <BonusMissionCard 
                            video={lessons[0].supplementaryVideos[0]} 
                            stars={progress[lessons[0].supplementaryVideos[0].id] || 0}
                            onComplete={onCompleteLevel}
                        />
                    )}

                    {/* Lesson 2 Card */}
                    <div className="bg-[#111827]/95 backdrop-blur-sm rounded-[2rem] p-8 border border-[#374151] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center">
                        <h2 className="text-xl font-black mb-8 text-[#60a5fa] uppercase tracking-widest">{lessons[1].title}</h2>
                        <div className="flex gap-8">
                            {lessons[1].levels.map((level, idx) => (
                                <LevelNode 
                                    key={level.id} 
                                    level={level} 
                                    status={getLevelStatus(level, progress, 1, idx)} 
                                    onSelectLevel={onSelectLevel} 
                                    stars={progress[level.id] || 0}
                                    onCompleteLevel={onCompleteLevel}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AVATARS = ['👩‍🚀', '🕵️‍♀️', '👨‍🌾', '👩‍🎨', '👨‍💻', '🦸‍♀️', '🧑‍🔬', '🧑‍🚒'];

const AvatarSelectionModal: React.FC<{ onSelect: (avatar: string) => void }> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col justify-center items-center z-[200] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center text-gray-800">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-2">Congratulations!</h2>
        <p className="text-xl text-slate-600 mb-8">You've earned enough stars to choose your explorer avatar!</p>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {AVATARS.map(avatar => (
            <button key={avatar} onClick={() => setSelected(avatar)} className={`text-5xl p-4 rounded-full transition-all ${selected === avatar ? 'bg-sky-200 ring-4 ring-sky-500 scale-110' : 'bg-slate-100 hover:bg-slate-200 hover:scale-105'}`}>{avatar}</button>
          ))}
        </div>
        <button onClick={() => selected && onSelect(selected)} disabled={!selected} className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-400 text-white font-bold py-3 px-12 rounded-lg text-xl transition-transform hover:scale-105">Choose</button>
      </div>
    </div>
  );
};

const PathCompletionModal: React.FC<{ onReplay: () => void; onClose: () => void; totalStars: number; selectedAvatar: string | null; }> = ({ onReplay, onClose, totalStars, selectedAvatar }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col justify-center items-center z-[200] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center text-gray-800">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 mb-2">Path Complete!</h2>
                <p className="text-xl text-slate-600 my-6">Congratulations, Explorer! You've mastered the topic and completed the entire journey.</p>
                <div className="flex justify-center items-center gap-4 my-8">
                    {selectedAvatar && <div className="text-6xl bg-slate-100 rounded-full p-2">{selectedAvatar}</div>}
                    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-full">
                        <StarIcon className="w-10 h-10" filled={true} />
                        <span className="text-4xl font-bold text-slate-700">{totalStars}</span>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">Back to Map</button>
                    <button onClick={onReplay} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">Play Again</button>
                </div>
            </div>
        </div>
    );
};

function App() {
    const allLevels = useMemo(() => LESSON_DEFINITIONS.flatMap(lesson => lesson.levels), []);
    const { progress, partialProgress, savePartialProgress, completeLevel, resetProgress, selectedAvatar, setSelectedAvatar } = usePlayerProgress(LESSON_DEFINITIONS);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarUnlockPending, setAvatarUnlockPending] = useState(false);
    const [showPathCompleteModal, setShowPathCompleteModal] = useState(false);
    const pathJustCompletedRef = useRef(false);
    const prevCurrentLevelId = useRef<string | null | undefined>(undefined);

    const totalStars = useMemo(() => Object.values(progress).reduce((sum, stars) => sum + stars, 0), [progress]);
    const prevTotalStarsRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!selectedAvatar && !avatarUnlockPending && totalStars >= AVATAR_UNLOCK_THRESHOLD && (prevTotalStarsRef.current === undefined || prevTotalStarsRef.current < AVATAR_UNLOCK_THRESHOLD)) {
            setAvatarUnlockPending(true);
        }
        prevTotalStarsRef.current = totalStars;
    }, [totalStars, selectedAvatar, avatarUnlockPending]);
    
    useEffect(() => {
        if (prevCurrentLevelId.current && !currentLevelId) {
            const timer = setTimeout(() => {
                if (avatarUnlockPending) { setShowAvatarModal(true); setAvatarUnlockPending(false); }
                else if (pathJustCompletedRef.current) { setShowPathCompleteModal(true); pathJustCompletedRef.current = false; }
            }, 500);
            return () => clearTimeout(timer);
        }
        prevCurrentLevelId.current = currentLevelId;
    }, [currentLevelId, avatarUnlockPending]);

    useEffect(() => {
        if (showPathCompleteModal) playSuccessSound();
    }, [showPathCompleteModal]);

    const handleLevelSelect = (levelId: string) => setCurrentLevelId(levelId);
    const handleBackToMap = () => setCurrentLevelId(null);
    const handleCompleteLevel = (stars: number) => { 
        if (currentLevelId) {
            completeLevel(currentLevelId, stars);
            setCurrentLevelId(null);
        }
    };
    const handleUnlockLevel = (levelId: string, stars: number) => completeLevel(levelId, stars);

    const currentLevel = allLevels.find(l => l.id === currentLevelId);

    return (
        <ToolbarProvider>
            <div className="min-h-screen bg-[#0a0f1e] font-sans text-white selection:bg-sky-500/30 overflow-x-hidden">
                {currentLevel ? (
                    <LevelView
                        level={currentLevel}
                        onBackToMap={handleBackToMap}
                        onComplete={handleCompleteLevel}
                        onExit={handleBackToMap}
                        partialProgress={partialProgress[currentLevel.id]}
                        onSavePartialProgress={(state) => savePartialProgress(currentLevel.id, state)}
                        progress={progress}
                        lessonTitle={LESSON_DEFINITIONS.find(lesson => lesson.levels.some(l => l.id === currentLevel.id))?.title}
                    />
                ) : (
                    <LevelMap 
                        lessons={LESSON_DEFINITIONS} 
                        progress={progress} 
                        onSelectLevel={handleLevelSelect} 
                        totalStars={totalStars}
                        selectedAvatar={selectedAvatar}
                        onCompleteLevel={handleUnlockLevel}
                    />
                )}
                {showAvatarModal && <AvatarSelectionModal onSelect={(avatar) => { setSelectedAvatar(avatar); setShowAvatarModal(false); }} />}
                {showPathCompleteModal && <PathCompletionModal onReplay={() => { resetProgress(); setShowPathCompleteModal(false); }} onClose={() => setShowPathCompleteModal(false)} totalStars={totalStars} selectedAvatar={selectedAvatar} />}
            </div>
        </ToolbarProvider>
    );
}

export default App;
