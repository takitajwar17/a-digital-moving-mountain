'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useComments } from '@/hooks/useComments';
import { useCanvas } from '@/hooks/useCanvas';
import { useImagePreloader, usePreloadStats } from '@/hooks/useImagePreloader';
import { Comment, CommentFilter } from '@/types/comment';
import { getDeviceType, isKioskMode } from '@/utils/deviceDetection';
import { findAvailablePosition } from '@/utils/coordinateSystem';

// Canvas components
import ArtworkPanel from '@/components/Canvas/ArtworkPanel';

// Sample data
import { 
  sampleArtworkPanels, 
  getAvailableYears
} from '@/data/sampleArtwork';

export default function Home() {
  const [filter] = useState<CommentFilter>({ approved: true });
  const [currentYear, setCurrentYear] = useState(2008); // Start with 2008 (financial crisis)
  
  // Handle QR code parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const yearParam = urlParams.get('year');
      const modeParam = urlParams.get('mode');
      
      if (yearParam) {
        const year = parseInt(yearParam);
        const availableYears = getAvailableYears();
        if (availableYears.includes(year)) {
          setCurrentYear(year);
        }
      }
      
      // Handle different modes (gallery, mobile, kiosk)
      if (modeParam === 'kiosk') {
        setKiosk(true);
      }
    }
  }, []);
  
  // Update filter when year changes
  const yearFilter = { ...filter, year: currentYear };
  const { comments, addNewComment } = useComments(yearFilter);
  const { settings, updateZoom, updatePan } = useCanvas();
  
  // Device and layout detection
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [, setKiosk] = useState(false);
  
  // Current artwork panel
  const currentPanel = sampleArtworkPanels.find(panel => panel.year === currentYear) || sampleArtworkPanels[0];
  
  // Comments for current panel (now only from Firebase)
  const panelComments = comments;
  
  // Available data for filters
  const availableYears = getAvailableYears();

  // Lazy loading - only preload current and adjacent images
  const imagesToPreload = useMemo(() => {
    const currentIndex = availableYears.indexOf(currentYear);
    const indices = [];
    // Current image
    indices.push(currentIndex);
    // Previous image
    if (currentIndex > 0) indices.push(currentIndex - 1);
    // Next image
    if (currentIndex < availableYears.length - 1) indices.push(currentIndex + 1);
    
    return indices.map(i => sampleArtworkPanels[i]?.imageUrl).filter(Boolean);
  }, [availableYears, currentYear]);

  const { 
    preloadedImages, 
    isLoading: imagesLoading 
  } = useImagePreloader(imagesToPreload, {
    preloadOnMount: true,
    maxConcurrent: 3,
    timeout: 10000
  });

  const preloadStats = usePreloadStats(preloadedImages);

  // Initialize device detection
  useEffect(() => {
    setDeviceType(getDeviceType());
    setKiosk(isKioskMode());
  }, []);

  // Handle comment addition
  const handleCommentAdd = async (position: { x: number; y: number }, text?: string, imageData?: string, color?: string) => {
    try {
      // Find suitable position to avoid collisions
      const availablePosition = findAvailablePosition(
        position,
        panelComments.map(c => c.position),
        0.05 // 5% minimum distance
      );

      await addNewComment({
        text,
        imageData,
        type: imageData ? 'drawing' : 'text',
        position: availablePosition,
        year: currentYear,
        device: deviceType,
        inputMethod: imageData ? 'stylus' : (deviceType === 'mobile' ? 'touch' : 'keyboard'),
        color: color || '#000000' // Default to black if no color provided
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handle comment click
  const handleCommentClick = (comment: Comment) => {
    console.log('Comment clicked:', comment);
    // TODO: Show comment details modal
  };


  // Handle year navigation
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  // Show loading screen only if current image is loading and no images are loaded yet
  const currentImageUrl = currentPanel.imageUrl;
  const currentImageStatus = preloadedImages.get(currentImageUrl);
  const isInitialLoading = !currentImageStatus?.loaded && !currentImageStatus?.error && imagesLoading && preloadStats.loaded === 0;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
      {/* Logo - Fixed position for all layouts */}
      <a 
        href="https://adigitalmovingmountain.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed top-4 left-4 z-50 w-12 h-12 transition-all duration-200 hover:scale-105"
      >
        <Image
          src="/logo.svg"
          alt="A Digital Moving Mountain"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </a>

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
            onSwipeLeft={goToNext}
            onSwipeRight={goToPrevious}
            className="h-full"
          />
          
          {/* Mobile zoom controls */}
          <div className="absolute top-4 right-4 flex gap-2 bg-black bg-opacity-75 p-2 rounded-lg">
            <button
              onClick={() => updateZoom(Math.max(settings.zoomLevel / 1.2, 0.5))}
              className="w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-bold text-lg touch-manipulation"
            >
              −
            </button>
            <span className="text-sm text-white px-3 py-1 flex items-center font-medium min-w-[50px] justify-center">
              {Math.round(settings.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => updateZoom(Math.min(settings.zoomLevel * 1.2, 3))}
              className="w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-bold text-lg touch-manipulation"
            >
              +
            </button>
            <button
              onClick={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
              className="w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors text-sm font-bold touch-manipulation"
            >
              ↺
            </button>
          </div>
        </div>
        
        {/* Mobile bottom navigation */}
        <div className="flex items-center justify-between p-4 bg-black text-white border-t border-gray-700 flex-shrink-0">
          <button
            onClick={goToPrevious}
            disabled={!prevPanel}
            className={`flex items-center gap-2 px-6 py-4 rounded-lg text-base font-medium min-h-[48px] touch-manipulation ${
              prevPanel 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40' 
                : 'bg-white bg-opacity-10 text-gray-400 cursor-not-allowed'
            }`}
          >
             {prevPanel ? prevPanel.year : 'Prev'}
          </button>
          
          <div className="text-center px-4">
            <p className="text-xl font-semibold">{currentPanel.year}</p>
          </div>
          
          <button
            onClick={goToNext}
            disabled={!nextPanel}
            className={`flex items-center gap-2 px-6 py-4 rounded-lg text-base font-medium min-h-[48px] touch-manipulation ${
              nextPanel 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40' 
                : 'bg-white bg-opacity-10 text-gray-400 cursor-not-allowed'
            }`}
          >
            {nextPanel ? nextPanel.year : 'Next'} 
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Left side - Previous image */}
        <div className="flex-1 flex items-center justify-center relative">
          {prevPanel && (
            <div className="relative cursor-pointer transition-all duration-300 hover:opacity-60" onClick={goToPrevious}>
              <Image
                src={prevPanel.imageUrl}
                alt={`Artwork ${prevPanel.year}`}
                width={800}
                height={600}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
                priority={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                   {prevPanel.year}
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
          <div className="absolute top-4 right-4 flex gap-2 bg-black bg-opacity-75 p-2 rounded-lg">
            <button
              onClick={() => updateZoom(Math.max(settings.zoomLevel / 1.2, 0.5))}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-bold text-base"
            >
              −
            </button>
            <span className="text-sm text-white px-3 py-1 flex items-center font-medium min-w-[50px] justify-center">
              {Math.round(settings.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => updateZoom(Math.min(settings.zoomLevel * 1.2, 3))}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors font-bold text-base"
            >
              +
            </button>
            <button
              onClick={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
              className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors text-sm font-bold"
            >
              ↺
            </button>
          </div>
        </div>

        {/* Right side - Next image */}
        <div className="flex-1 flex items-center justify-center relative">
          {nextPanel && (
            <div className="relative cursor-pointer transition-all duration-300 hover:opacity-60" onClick={goToNext}>
              <Image
                src={nextPanel.imageUrl}
                alt={`Artwork ${nextPanel.year}`}
                width={800}
                height={600}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
                priority={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                  {nextPanel.year} 
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}