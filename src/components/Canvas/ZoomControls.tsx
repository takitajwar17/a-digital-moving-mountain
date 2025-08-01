'use client';

import { Plus, Minus, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
  className?: string;
}

export default function ZoomControls({
  zoomLevel,
  onZoomChange,
  onReset,
  className = ''
}: ZoomControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel * 1.2, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel / 1.2, 0.5));
  };

  const isVertical = className?.includes('flex-col');
  
  return (
    <div className={`flex ${isVertical ? 'flex-col items-center' : 'items-center'} gap-1 bg-black bg-opacity-75 p-1.5 rounded-lg ${className?.replace('flex-col', '') || ''}`}>
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-md transition-colors font-bold text-sm"
        title="Zoom In"
      >
        <Plus className="h-4 w-4" />
      </button>
      
      <div className="text-xs text-white px-1 flex items-center justify-center font-medium min-w-[40px]">
        {Math.round(zoomLevel * 100)}%
      </div>
      
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-md transition-colors font-bold text-sm"
        title="Zoom Out"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-md transition-colors text-xs font-bold"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}