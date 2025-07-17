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

  // Main artwork panel component
  const artworkPanelComponent = (
    <ArtworkPanel
      panel={currentPanel}
      comments={panelComments}
      onCommentAdd={handleCommentAdd}
      onCommentClick={handleCommentClick}
      zoomLevel={settings.zoomLevel}
      onZoomChange={updateZoom}
      panPosition={settings.panPosition}
      onPanChange={updatePan}
      className="w-full h-full"
    />
  );

  // Year navigation with loading indicator
  const yearNavigation = (
    <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-200 overflow-x-auto">
      {availableYears.map(year => {
        const panelImage = sampleArtworkPanels.find(p => p.year === year);
        const isImageReady = panelImage && preloadedImages.get(panelImage.imageUrl)?.loaded;
        
        return (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap relative ${
              year === currentYear
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {year}
            {/* Image loading indicator */}
            {!isImageReady && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </button>
        );
      })}
      
      {/* Subtle loading indicator for comments */}
      {commentsLoading && (
        <div className="ml-4 flex items-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-xs">Loading comments...</span>
        </div>
      )}
      
      {/* Image preload status */}
      {imagesLoading && (
        <div className="ml-4 flex items-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-xs">
            Loading images... {preloadStats.loaded}/{preloadStats.total}
          </span>
        </div>
      )}
      
      {/* Debug panel */}
      {showDebug && (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">
            💬 {comments.length} comments stored
          </span>
          <button
            onClick={clearComments}
            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );

  // Render appropriate layout based on device type
  if (deviceType === 'mobile') {
    return (
      <MobileLayout
        filter={filter}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
      >
        {yearNavigation}
        {artworkPanelComponent}
      </MobileLayout>
    );
  }

  if (deviceType === 'tablet') {
    return (
      <TabletLayout
        filter={filter}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
        isKioskMode={kiosk}
      >
        {yearNavigation}
        {artworkPanelComponent}
      </TabletLayout>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      filter={filter}
      onFilterChange={handleFilterChange}
      availableYears={availableYears}
      availableLanguages={availableLanguages}
      totalComments={panelComments.length}
    >
      {yearNavigation}
      {artworkPanelComponent}
    </DesktopLayout>
  );
}