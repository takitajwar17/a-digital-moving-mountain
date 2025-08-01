'use client';

import { useState } from 'react';
import CommentModal from '@/components/Input/CommentModal';
import DrawingCanvas from '@/components/Drawing/DrawingCanvas';

interface CommentModeSelectorProps {
  onSubmitText: (text: string) => void;
  onSubmitDrawing: (imageData: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function CommentModeSelector({
  onSubmitText,
  onSubmitDrawing,
  onCancel,
  className = ''
}: CommentModeSelectorProps) {
  const [mode, setMode] = useState<'select' | 'text' | 'drawing'>('text');

  const handleTextSubmit = (text: string) => {
    onSubmitText(text);
  };

  const handleDrawingSubmit = (imageData: string) => {
    onSubmitDrawing(imageData);
  };

  if (mode === 'text') {
    return (
      <div 
        className={`bg-white rounded-lg shadow-lg p-4 w-full max-w-sm md:min-w-64 md:max-w-80 ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-black">Add Comment</h3>
          <button
            onClick={() => setMode('drawing')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Switch to drawing mode"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 14L10 6L14 2L12 4L6 10L2 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <CommentModal
          onSubmit={handleTextSubmit}
          onCancel={onCancel}
          className="bg-transparent shadow-none p-0"
          embedded={true}
        />
      </div>
    );
  }

  if (mode === 'drawing') {
    return (
      <div 
        className={`bg-white rounded-lg shadow-lg p-4 w-full max-w-sm md:min-w-64 md:max-w-80 ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-black">Draw Comment</h3>
          <button
            onClick={() => setMode('text')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Switch to text mode"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3.5C2 3.22386 2.22386 3 2.5 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M5 6H11M5 8H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <DrawingCanvas
          onSave={handleDrawingSubmit}
          onCancel={onCancel}
          className="bg-transparent shadow-none p-0"
        />
      </div>
    );
  }

  // Mode selection
  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 w-full max-w-sm md:min-w-64 md:max-w-80 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
        Add Comment
      </h3>
      
      <div className="space-y-2">
        <button
          onClick={() => setMode('text')}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3.5C2 3.22386 2.22386 3 2.5 3H13.5C13.7761 3 14 3.22386 14 3.5V12.5C14 12.7761 13.7761 13 13.5 13H2.5C2.22386 13 2 12.7761 2 12.5V3.5Z"
                stroke="#3B82F6"
                strokeWidth="1.5"
              />
              <path
                d="M5 6H11M5 8H9"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">Text Comment</div>
            <div className="text-sm text-gray-600">Type your thoughts</div>
          </div>
        </button>

        <button
          onClick={() => setMode('drawing')}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 14L10 6L14 2L12 4L6 10L2 14Z"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 8L10 6"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">Draw Comment</div>
            <div className="text-sm text-gray-600">Sketch with stylus or finger</div>
          </div>
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-base text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}