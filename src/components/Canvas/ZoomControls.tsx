'use client';

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

  return (
    <div className={`flex flex-col gap-2 bg-white bg-opacity-90 p-2 rounded-lg shadow-md ${className}`}>
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title="Zoom In"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="text-xs text-center text-gray-600 px-1">
        {Math.round(zoomLevel * 100)}%
      </div>

      <button
        onClick={handleZoomOut}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title="Zoom Out"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors text-xs"
        title="Reset View"
      >
        ⌂
      </button>
    </div>
  );
}