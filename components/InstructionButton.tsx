import React from 'react';

interface InstructionButtonProps {
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

const InstructionButton: React.FC<InstructionButtonProps> = ({ onClick, className = '', disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`fixed bottom-4 right-4 z-[102] bg-sky-600 hover:bg-sky-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-sky-600 ${className}`}
            aria-label="Show instructions"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
};

export default InstructionButton;