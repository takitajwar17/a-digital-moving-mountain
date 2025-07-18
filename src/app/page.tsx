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


  // Get previous and next panels
  const currentIndex = availableYears.indexOf(currentYear);
  const prevYear = currentIndex > 0 ? availableYears[currentIndex - 1] : null;
  const nextYear = currentIndex < availableYears.length - 1 ? availableYears[currentIndex + 1] : null;
  const prevPanel = prevYear ? sampleArtworkPanels.find(p => p.year === prevYear) : null;
  const nextPanel = nextYear ? sampleArtworkPanels.find(p => p.year === nextYear) : null;

  // Navigation handlers
  const goToPrevious = () => {
    if (prevYear) handleYearChange(prevYear);
  };
  
  const goToNext = () => {
    if (nextYear) handleYearChange(nextYear);
  };

  // Responsive layout
  return (
    <div className="h-screen overflow-hidden bg-black">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile main image */}
        <div className="flex-1 relative">
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
          
          {/* Mobile zoom controls */}
          <div className="absolute top-4 right-4 flex gap-2 bg-black p-2 rounded">
            <button
              onClick={() => updateZoom(Math.max(settings.zoomLevel / 1.2, 0.5))}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors font-bold"
            >
              −
            </button>
            <span className="text-xs text-white px-2 py-1 flex items-center font-medium">
              {Math.round(settings.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => updateZoom(Math.min(settings.zoomLevel * 1.2, 3))}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors font-bold"
            >
              +
            </button>
            <button
              onClick={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors text-xs font-bold"
            >
              ⌂
            </button>
          </div>
        </div>
        
        {/* Mobile bottom navigation */}
        <div className="flex items-center justify-between p-4 bg-black text-white border-t border-gray-700 flex-shrink-0">
          <button
            onClick={goToPrevious}
            disabled={!prevPanel}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
              prevPanel 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40' 
                : 'bg-white bg-opacity-10 text-gray-400 cursor-not-allowed'
            }`}
          >
            ← {prevPanel ? prevPanel.year : 'Prev'}
          </button>
          
          <div className="text-center px-4">
            <p className="text-lg font-semibold">{currentPanel.year}</p>
          </div>
          
          <button
            onClick={goToNext}
            disabled={!nextPanel}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
              nextPanel 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40' 
                : 'bg-white bg-opacity-10 text-gray-400 cursor-not-allowed'
            }`}
          >
            {nextPanel ? nextPanel.year : 'Next'} →
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Left side - Previous image */}
        <div className="flex-1 flex items-center justify-center relative">
          {prevPanel && (
            <div className="relative cursor-pointer transition-all duration-300 hover:opacity-60" onClick={goToPrevious}>
              <img
                src={prevPanel.imageUrl}
                alt={`${prevPanel.title} - ${prevPanel.year}`}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                  ← {prevPanel.year}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center - Main image */}
        <div className="flex-shrink-0 flex items-center justify-center relative">
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
          
          {/* Overlay controls */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded">
            <p className="text-lg font-semibold">{currentPanel.year}</p>
          </div>
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex gap-2 bg-black p-2 rounded">
            <button
              onClick={() => updateZoom(Math.max(settings.zoomLevel / 1.2, 0.5))}
              className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors font-bold"
            >
              −
            </button>
            <span className="text-xs text-white px-2 py-1 flex items-center font-medium">
              {Math.round(settings.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => updateZoom(Math.min(settings.zoomLevel * 1.2, 3))}
              className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors font-bold"
            >
              +
            </button>
            <button
              onClick={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
              className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded transition-colors text-xs font-bold"
            >
              ⌂
            </button>
          </div>
        </div>

        {/* Right side - Next image */}
        <div className="flex-1 flex items-center justify-center relative">
          {nextPanel && (
            <div className="relative cursor-pointer transition-all duration-300 hover:opacity-60" onClick={goToNext}>
              <img
                src={nextPanel.imageUrl}
                alt={`${nextPanel.title} - ${nextPanel.year}`}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                  {nextPanel.year} →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}