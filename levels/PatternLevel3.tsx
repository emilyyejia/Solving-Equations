
import React from 'react';
import type { LevelComponentProps } from '../types';

const PatternLevel3: React.FC<LevelComponentProps> = ({ onExit }) => (
  <div className="flex items-center justify-center h-full text-white text-center p-8">
    <div className="max-w-md bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
      <h2 className="text-3xl font-bold text-sky-400 mb-4 italic">Final Boss Incoming</h2>
      <p className="text-gray-400 mb-8">The Pattern Master is preparing your challenge. Come back soon!</p>
      <button onClick={onExit} className="bg-sky-600 hover:bg-sky-500 px-8 py-3 rounded-xl font-bold">Back to Map</button>
    </div>
  </div>
);

export default PatternLevel3;
