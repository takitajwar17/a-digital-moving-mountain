'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save, X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
  className?: string;
}

export default function DrawingCanvas({ onSave, onCancel, className = '' }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on device
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    canvas.width = isMobile ? 280 : 300;
    canvas.height = isMobile ? 250 : 200;

    // Set drawing style
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
    onSave(imageData);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="text-center">
        <CardTitle>Draw Your Comment</CardTitle>
        <CardDescription>
          Use your finger or stylus to draw
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-border rounded-md cursor-crosshair touch-none bg-background"
            style={{ touchAction: 'none', maxHeight: '60vh' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={clearCanvas}
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={saveDrawing}
            disabled={!hasDrawn}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Drawing
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}