'use client';

import { useState } from 'react';
import { MessageSquare, Paintbrush, X, Type, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentModal from '@/components/Input/CommentModal';
import DrawingCanvas from '@/components/Drawing/DrawingCanvas';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

interface CommentModeSelectorProps {
  onSubmitText: (text: string, color: string) => void;
  onSubmitDrawing: (imageData: string, color: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function CommentModeSelector({
  onSubmitText,
  onSubmitDrawing,
  onCancel,
  className = ''
}: CommentModeSelectorProps) {
  const [mode, setMode] = useState<'text' | 'drawing'>('text');
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const maxLength = 250;
  const remainingChars = maxLength - text.length;

  const handleTextSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitText(text.trim(), selectedColor);
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrawingSubmit = () => {
    if (!canvasRef || !hasDrawn) return;
    const imageData = canvasRef.toDataURL('image/png');
    onSubmitDrawing(imageData, selectedColor);
  };

  const handleSubmit = () => {
    if (mode === 'text') {
      handleTextSubmit();
    } else {
      handleDrawingSubmit();
    }
  };

  return (
    <div 
      className={cn("w-[400px] h-[300px] bg-white rounded-xl border shadow-lg flex flex-col overflow-hidden", className)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="relative">
        <div className="flex items-start justify-between p-4 pb-2">
          <h2 className="text-base font-semibold">Add Comment</h2>
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Mode indicators - horizontal below header, aligned right */}
        <div className="flex gap-2 px-4 pb-2 justify-end">
          <button
            onClick={() => setMode('text')}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center transition-colors",
              mode === 'text' ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            title="Text mode"
          >
            <Type className="h-3 w-3" />
          </button>
          <button
            onClick={() => setMode('drawing')}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center transition-colors",
              mode === 'drawing' ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            title="Drawing mode"
          >
            <PenTool className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 px-4 pb-2 min-h-0">
        {mode === 'text' ? (
          <div className="h-full flex flex-col">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxLength))}
              placeholder="Share your thoughts..."
              className="flex-1 w-full resize-none border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              style={{ minHeight: '120px' }}
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {text.length}/{maxLength}
            </div>
          </div>
        ) : (
          <DrawingCanvas
            onSave={(imageData) => {
              // This will be handled by handleSubmit
              setHasDrawn(true);
            }}
            onCancel={onCancel}
            className="h-full border-none shadow-none bg-transparent p-0"
            embedded={true}
            onCanvasReady={setCanvasRef}
            onDrawingChange={setHasDrawn}
            selectedColor={selectedColor}
          />
        )}
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-1">
          {/* Color picker - show all three colors */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSelectedColor('#000000')}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                selectedColor === '#000000' 
                  ? "border-gray-800 ring-2 ring-gray-400 ring-offset-1" 
                  : "border-gray-300 hover:border-gray-400"
              )}
              style={{ backgroundColor: '#000000' }}
              title="Black"
            />
            <button
              type="button"
              onClick={() => setSelectedColor('#ffffff')}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                selectedColor === '#ffffff' 
                  ? "border-gray-400 ring-2 ring-gray-400 ring-offset-1" 
                  : "border-gray-300 hover:border-gray-400"
              )}
              style={{ backgroundColor: '#ffffff' }}
              title="White"
            />
            <button
              type="button"
              onClick={() => setSelectedColor('#6b7280')}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                selectedColor === '#6b7280' 
                  ? "border-gray-600 ring-2 ring-gray-400 ring-offset-1" 
                  : "border-gray-300 hover:border-gray-400"
              )}
              style={{ backgroundColor: '#6b7280' }}
              title="Gray"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-8 px-4 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={(mode === 'text' && !text.trim()) || (mode === 'drawing' && !hasDrawn)}
            className="h-8 px-4 text-xs"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}