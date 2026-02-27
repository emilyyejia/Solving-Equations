import React, { useRef, useEffect } from 'react';
import type { Level, PlayerProgress } from '../types';
import { useToolbar } from '../hooks/useToolbarState';
import Toolbar from './toolbar/Toolbar';
import HelpModal from './toolbar/HelpModal';
import TextToSpeech from './toolbar/TextToSpeech';
import LineReader from './toolbar/LineReader';
import Notes from './toolbar/Notes';
import Calculator from './toolbar/Calculator';
import DocumentsModal from './toolbar/DocumentsModal';
import Highlighter from './toolbar/Highlighter';


interface LevelViewProps {
  level: Level;
  onBackToMap: () => void;
  onComplete: (stars: number) => void;
  onExit: () => void;
  partialProgress?: any;
  onSavePartialProgress?: (state: any | null) => void;
  progress?: PlayerProgress;
  lessonTitle?: string | null;
  onNext?: () => void;
}

const LevelView: React.FC<LevelViewProps> = ({ level, onBackToMap, onComplete, onExit, partialProgress, onSavePartialProgress, progress, lessonTitle, onNext }) => {
  const LevelComponent = level.component;
  const { 
    activeTool, 
    zoomLevel, 
    isHighContrast, 
    lineReaderPosition, 
    showLineReader
  } = useToolbar();
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // When changing levels, close any active tool to avoid weird state issues
  useEffect(() => {
    // This is a placeholder for a function that would reset tool state.
    // In a real app, you might call `setActiveTool(null)` from the context.
    // For now, this effect just marks the dependency on `level.id`.
  }, [level.id]);
  
  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4 flex flex-col animate-fade-in ${isHighContrast ? 'high-contrast' : ''}`}>
      <div className="relative z-[101] flex-shrink-0 mb-4 flex items-center justify-between">
        <button
          onClick={onBackToMap}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          &larr; Back to Map
        </button>
        {lessonTitle ? (
            <h1 className="text-xl font-bold text-sky-300 tracking-wide">
                {lessonTitle}{level.name ? `: ${level.name}` : ''}
            </h1>
        ) : <div />}
      </div>

      <div id="level-content-container" ref={contentWrapperRef} className="flex-grow relative overflow-auto">
        <Highlighter contentRef={contentWrapperRef} />
        <div 
          className="transition-transform duration-200" 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          <LevelComponent
            topic={level.topic}
            onComplete={onComplete}
            onExit={onExit}
            questions={level.questions}
            isGated={level.isGated}
            partialProgress={partialProgress}
            onSavePartialProgress={onSavePartialProgress}
            progress={progress}
            levelId={level.id}
            onNext={onNext}
          />
        </div>
      </div>

      <Toolbar />
      {activeTool === 'help' && <HelpModal />}
      {activeTool === 'listen' && <TextToSpeech contentRef={contentWrapperRef} />}
      {showLineReader && <LineReader initialPosition={lineReaderPosition} />}
      {activeTool === 'notes' && <Notes />}
      {activeTool === 'calculator' && <Calculator />}
      {activeTool === 'documents' && <DocumentsModal />}
    </div>
  );
};

export default LevelView;