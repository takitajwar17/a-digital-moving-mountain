'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  onSave: (imageData: string, color: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function DrawingCanvas({ onSave, onCancel, className = '' }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set consistent canvas size with better landscape proportions (50% of original)
    canvas.width = 210;
    canvas.height = 80;

    // Set drawing style - check for mobile viewport
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    ctx.lineWidth = isMobile ? 2 : 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;

    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [selectedColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Update stroke style to current selected color
    ctx.strokeStyle = selectedColor;
    
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
    onSave(imageData, selectedColor);
  };

  return (
    <div className={cn("w-full h-full bg-white rounded-xl border shadow-sm flex flex-col", className)}>
      <div className="p-2 flex-1 flex flex-col space-y-2">
        {/* Color Picker */}
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {/* Canvas Section */}
        <div className="flex-1 flex flex-col space-y-2">
          <div className="flex-1 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="border border-border rounded-md cursor-crosshair touch-none bg-white"
              style={{ touchAction: 'none', width: '210px', height: '80px' }}
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
              className="h-6 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between px-2 pb-2 border-t pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-8 text-xs order-2 sm:order-1"
        >
          Cancel
        </Button>

        <Button
          onClick={saveDrawing}
          disabled={!hasDrawn}
          className="h-8 text-xs order-1 sm:order-2"
        >
          <Save className="h-3 w-3 mr-1" />
          Save Drawing
        </Button>
      </div>
    </div>
  );
}