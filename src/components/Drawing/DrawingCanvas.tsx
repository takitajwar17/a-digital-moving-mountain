'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  onSave: (imageData: string, text?: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function DrawingCanvas({ onSave, onCancel, className = '' }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set consistent canvas size
    canvas.width = 300;
    canvas.height = 180;

    // Set drawing style - check for mobile viewport
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    ctx.lineWidth = isMobile ? 3 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to PNG data URL
    const imageData = canvas.toDataURL('image/png');
    onSave(imageData, text.trim() || undefined);
  };

  return (
    <div className={cn("w-full bg-white rounded-xl border shadow-sm", className)}>
      <div className="p-6 space-y-4">
        {/* Canvas Section */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-border rounded-md cursor-crosshair touch-none bg-white"
              style={{ touchAction: 'none', width: '100%', maxWidth: '300px', height: '180px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={clearCanvas}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Drawing
            </Button>
          </div>
        </div>

        {/* Text Section - matching CommentModal */}
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a text description (optional)..."
            rows={3}
            className="resize-none bg-white min-h-[80px]"
            maxLength={280}
          />
          
          {/* Character count */}
          <div className="flex justify-end text-xs text-muted-foreground">
            <span className={cn(
              text.length > 260 ? "text-destructive" : 
              text.length > 240 ? "text-yellow-600" : "text-muted-foreground"
            )}>
              {text.length}/280
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between px-6 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          onClick={saveDrawing}
          disabled={!hasDrawn}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Drawing
        </Button>
      </div>
    </div>
  );
}