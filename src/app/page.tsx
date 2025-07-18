'use client';

import { useState, useEffect, useMemo } from 'react';
import { useComments } from '@/hooks/useComments';
import { useCanvas } from '@/hooks/useCanvas';
import { useImagePreloader, usePreloadStats } from '@/hooks/useImagePreloader';
import { CommentFilter } from '@/types/comment';
import { getDeviceType, isKioskMode } from '@/utils/deviceDetection';
// No need for detectLanguage import here as it's handled in useComments
import { findAvailablePosition } from '@/utils/coordinateSystem';

// Layout components
import MobileLayout from '@/components/Layout/MobileLayout';
import TabletLayout from '@/components/Layout/TabletLayout';
import DesktopLayout from '@/components/Layout/DesktopLayout';

// Canvas components
import ArtworkPanel from '@/components/Canvas/ArtworkPanel';

// Sample data
import { 
  sampleArtworkPanels, 
  sampleComments, 
  getAvailableYears, 
  getAvailableLanguages
} from '@/data/sampleArtwork';

export default function Home() {
  const [filter, setFilter] = useState<CommentFilter>({ approved: true });
  const { comments, loading: commentsLoading, addNewComment, clearComments } = useComments(filter);
  const { settings, updateZoom, updatePan, resetView } = useCanvas();
  
  // Device and layout detection
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [kiosk, setKiosk] = useState(false);
  
  // Current artwork panel
  const [currentYear, setCurrentYear] = useState(2008); // Start with 2008 (financial crisis)
  const currentPanel = sampleArtworkPanels.find(panel => panel.year === currentYear) || sampleArtworkPanels[0];
  
  // Comments for current panel
  const panelComments = [...sampleComments.filter(comment => comment.year === currentYear), ...comments];
  
  // Available data for filters
  const availableYears = getAvailableYears();
  const availableLanguages = getAvailableLanguages();

  // Debug mode (only in development)
  const [showDebug, setShowDebug] = useState(false);

  // Image preloading with progress tracking - memoize to prevent infinite loops
  const artworkImageUrls = useMemo(() => sampleArtworkPanels.map(panel => panel.imageUrl), []);
  const { 
    preloadedImages, 
    isLoading: imagesLoading 
  } = useImagePreloader(artworkImageUrls, {
    preloadOnMount: true,
    maxConcurrent: 3,
    timeout: 15000
  });

  const preloadStats = usePreloadStats(preloadedImages);

  // Initialize device detection
  useEffect(() => {
    setDeviceType(getDeviceType());
    setKiosk(isKioskMode());
    
    // Show debug panel in development
    if (process.env.NODE_ENV === 'development') {
      setShowDebug(true);
    }
  }, []);

  // Handle comment addition
  const handleCommentAdd = async (position: { x: number; y: number }, text: string) => {
    try {
      // Find suitable position to avoid collisions
      const availablePosition = findAvailablePosition(
        position,
        panelComments.map(c => c.position),
        0.05 // 5% minimum distance
      );

      await addNewComment({
        text,
        position: availablePosition,
        year: currentYear,
        device: deviceType,
        inputMethod: deviceType === 'mobile' ? 'touch' : 'keyboard'
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handle comment click
  const handleCommentClick = (comment: { id: string; text: string; position: { x: number; y: number }; year: number; timestamp: number }) => {
    console.log('Comment clicked:', comment);
    // TODO: Show comment details modal
  };

  // Handle filter changes
  const handleFilterChange = (newFilter: CommentFilter) => {
    setFilter(newFilter);
    if (newFilter.year && newFilter.year !== currentYear) {
      setCurrentYear(newFilter.year);
    }
  };

  // Handle year navigation
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setFilter({ ...filter, year });
  };

  // Show loading screen only during initial image preload
  const isInitialLoading = imagesLoading && preloadStats.loaded === 0;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Footprints Across the Ocean&hellip;</p>
          
          {/* Progress indicator for image preloading */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${preloadStats.progress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Loading artwork images... {preloadStats.loaded}/{preloadStats.total}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main artwork panel component (right side)
  const artworkPanelComponent = (
    <div className="h-screen bg-black" style={{ width: 'auto', flexShrink: 0 }}>
      <ArtworkPanel
        panel={currentPanel}
        comments={panelComments}
        onCommentAdd={handleCommentAdd}
        onCommentClick={handleCommentClick}
        zoomLevel={settings.zoomLevel}
        onZoomChange={updateZoom}
        panPosition={settings.panPosition}
        onPanChange={updatePan}
        className="h-full"
      />
    </div>
  );

  // Left sidebar with all controls
  const leftSidebar = (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Year navigation */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Years</h2>
        <div className="grid grid-cols-3 gap-2">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                year === currentYear
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Current panel info */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg text-gray-900">{currentPanel.title}</h3>
        <p className="text-gray-800 mb-2 font-medium">{currentPanel.year}</p>
        <p className="text-sm text-gray-700">
          {panelComments.length} comment{panelComments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Zoom controls */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium mb-3 text-gray-900">Zoom</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateZoom(Math.max(settings.zoomLevel / 1.2, 0.5))}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors text-gray-900 font-medium"
          >
            −
          </button>
          <span className="text-sm font-mono min-w-[50px] text-center text-gray-900 font-medium">
            {Math.round(settings.zoomLevel * 100)}%
          </span>
          <button
            onClick={() => updateZoom(Math.min(settings.zoomLevel * 1.2, 3))}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors text-gray-900 font-medium"
          >
            +
          </button>
          <button
            onClick={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors text-sm text-gray-900 font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 text-sm text-gray-800">
        <p className="mb-2 font-medium">Click on the image to add a comment</p>
        <p className="font-medium">Drag to pan, use zoom controls to explore</p>
      </div>
    </div>
  );

  // New split layout for all devices
  return (
    <div className="flex h-screen overflow-hidden">
      {leftSidebar}
      {artworkPanelComponent}
    </div>
  );
}